# 📐 Design Document

## 1. Database Schema Design & Entity Relationships

### **Entities**

- **User**
  - `id` (PK), `firstName`, `lastName`, `email` (unique), `createdAt`, `updatedAt`
  - Relations: 
    - One-to-many with `Post` (author)
    - One-to-many with `Follow` (as follower and following)

- **Post**
  - `id` (PK), `content`, `authorId` (FK), `createdAt`, `updatedAt`
  - Relations:
    - Many-to-one with `User` (author)
    - One-to-many with `Like`
    - One-to-many with `PostHashtag`

- **Like**
  - `id` (PK), `userId` (FK), `postId` (FK), `createdAt`
  - Relations:
    - Many-to-one with `User`
    - Many-to-one with `Post`

- **Follow**
  - `id` (PK), `followerId` (FK), `followingId` (FK), `isActive`, `unfollowedAt`, `createdAt`
  - Relations:
    - Many-to-one with `User` (follower)
    - Many-to-one with `User` (following)

- **Hashtag**
  - `id` (PK), `name` (unique), `createdAt`, `updatedAt`
  - Relations:
    - One-to-many with `PostHashtag`

- **PostHashtag**
  - `id` (PK), `postId` (FK), `hashtagId` (FK), `createdAt`
  - Relations:
    - Many-to-one with `Post`
    - Many-to-one with `Hashtag`

### **Entity Relationship Diagram (ERD)**
```
User ──< Post ──< PostHashtag >── Hashtag
 │         │
 │         └──< Like >── User
 │
 └──< Follow >── User
```

---

## 2. Indexing Strategy for Performance Optimization

- **User**
  - Unique index on `email` for fast lookups and to prevent duplicates.

- **Post**
  - Index on `authorId` for efficient feed queries.
  - Index on `createdAt` for sorting feeds.

- **Like**
  - Composite unique index on (`userId`, `postId`) to prevent duplicate likes and speed up like checks.

- **Follow**
  - Composite unique index on (`followerId`, `followingId`, `isActive`) for fast follow/unfollow checks.
  - Index on `followingId` for quick follower lookups.

- **Hashtag**
  - Unique index on `name` for fast hashtag search (case-insensitive queries should use normalized/LOWER(name) if needed).

- **PostHashtag**
  - Composite unique index on (`postId`, `hashtagId`) to prevent duplicate tags.
  - Indexes on `postId` and `hashtagId` for efficient hashtag and post lookups.

---

## 3. Scalability Considerations and Solutions

The application design incorporates several strategies to handle growth in data volume and user traffic:

* **Normalized Database Design & Relationships:**
    * *Rationale:* The schema is intentionally normalized, storing distinct pieces of data in separate, related tables (User, Post, Hashtag) linked by foreign keys (`authorId`, `userId`, `postId`, etc.). Association tables (`Like`, `Follow`, `PostHashtag`) are used to manage many-to-many relationships cleanly (User-Post likes, User-User follows, Post-Hashtag tags). This design minimizes data redundancy, enhances data integrity (e.g., user details are updated in only one place), and simplifies data management rules.
    * *Interaction:* This normalized structure means controllers often need to retrieve data from multiple tables simultaneously (e.g., fetching posts along with author information). The controllers utilize TypeORM's built-in relation-loading features for simpler cases or rely on more complex query strategies where needed.

* **Strategic Indexing for Performance:**
    * *Interaction & Performance:* The defined indexing strategy (unique indexes on `email`, `name`; composite unique indexes on `Like`, `Follow`, `PostHashtag` pairings; standard indexes on foreign keys and frequently queried/sorted columns like `createdAt`, `authorId`) is *crucial* for efficient data retrieval. These indexes allow the database to quickly locate specific records, perform joins between related tables, and handle sorting/filtering without resorting to slow, full table scans. This directly supports the performance of controller operations, especially as the data volume grows. The composite indexes also play a vital role in maintaining data consistency by preventing duplicate relationships (likes, follows, tags).

* **Efficient Querying (ORM vs. QueryBuilder/Raw SQL):**
    * *Rationale:* While standard TypeORM repository methods (`find`, `findOneBy`, `save`) are suitable and used for straightforward single-entity CRUD operations, certain complex API requirements necessitate more optimized database queries.
    * *Specific Use Cases:* Endpoints demanding aggregation or combined results from disparate data structures, such as the User Activity feed (`/users/{id}/activity`), pose a challenge for simple ORM calls. This feed needs to fetch and interleave data from Posts, Likes, and Follows, sorted chronologically. Attempting this by making separate ORM calls for each type is highly inefficient (leading to multiple database round trips, fetching excessive data into the application layer, and requiring complex in-memory merging, sorting, and pagination).
    * *Solution & Interaction:* For these complex scenarios, we employ TypeORM's `QueryBuilder` or raw SQL (`AppDataSource.manager.query`). This allows crafting optimized SQL queries (often using techniques like `UNION ALL`) that delegate the heavy lifting of filtering across different tables, combining results, sorting (`ORDER BY`), and pagination (`LIMIT`/`OFFSET`) directly to the database engine. This approach is significantly more performant, reduces application server load (memory/CPU), minimizes network traffic between the application and database, and scales much more effectively for data-intensive endpoints compared to relying solely on basic ORM methods for every task.

* **Pagination:** All list endpoints (e.g., fetching multiple users, posts, followers, feeds) strictly implement `limit` and `offset` query parameters. This ensures that data is retrieved in manageable chunks, preventing performance degradation or excessive memory consumption on both the server and client, regardless of the total number of records in a table.

* **Migrations:** Database schema evolution is managed exclusively through TypeORM migrations (`src/migrations/**/*.ts`). This provides a safe, version-controlled, and repeatable process for applying schema changes across different deployment environments (development, testing, production), preventing inconsistencies and allowing for controlled rollbacks if necessary.

* **Stateless API Design:** The adherence to RESTful principles results in generally stateless API endpoints (regarding application data between requests). This simplifies scaling, as multiple instances of the application server can be run behind a load balancer without needing complex session management for most operations.

* **Denormalization Considerations (Future):** Currently, aggregate counts (like `likeCount`, `followerCount`) are calculated dynamically upon request. For systems experiencing very high read volumes on these specific data points, future optimizations might include strategic denormalization – adding count columns directly to the relevant entities (e.g., `posts.like_count`, `users.follower_count`) and keeping them updated via database triggers, background jobs, or application-level logic. Caching is another alternative to reduce load for these counts.

* **Future Improvements:** For scenarios demanding very high traffic and availability, further scaling strategies can be implemented:
    * **Database Read Replicas:** Offloading read queries to separate database instances to reduce load on the primary write database.
    * **Caching Layers (e.g., Redis, Memcached):** Implementing caching for frequently accessed and relatively stable data (like user profiles, popular posts, potentially computed feeds) to reduce database latency and load.
    * **Message Queues (e.g., RabbitMQ, Kafka):** Decoupling time-consuming or non-critical tasks (like sending notifications, background processing, updating search indexes) by pushing them onto a queue for asynchronous processing by dedicated workers.


---

## 4. Other Important Design Considerations

- **Soft Deletes:** Follows use `isActive` and `unfollowedAt` for soft deletes, preserving history.
- **Consistency:** All entities follow a consistent naming and relationship pattern.
- **Extensibility:** The schema supports easy addition of new features (e.g., comments, media).
- **Security:** Unique constraints help prevent common data issues; further improvements could include authentication and authorization layers.
- **Testing:** All endpoints are covered by shell-based integration tests for reliability.

---
