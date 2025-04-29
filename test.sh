#!/bin/bash

# Base URLs
USERS_URL="http://localhost:3000/api/users"
POSTS_URL="http://localhost:3000/api/posts"
FOLLOWS_URL="http://localhost:3000/api/follows"
LIKES_URL="http://localhost:3000/api/likes"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    # Add error handling by checking the response status code
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$endpoint" -H "Content-Type: application/json" -d "$data")
    fi
    
    # Extract status code and response body
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Handle response based on status code
    if [[ $status_code -ge 200 ]] && [[ $status_code -lt 300 ]]; then
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}Error: HTTP Status $status_code${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    fi
    echo ""
}

# User-related functions
test_get_all_users() {
    print_header "Testing GET all users"
    make_request "GET" "$USERS_URL"
}

test_get_user() {
    print_header "Testing GET user by ID"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id"
}

test_create_user() {
    print_header "Testing POST create user"
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter email: " email
    
    local user_data=$(cat <<EOF
{
    "firstName": "$firstName",
    "lastName": "$lastName",
    "email": "$email"
}
EOF
)
    make_request "POST" "$USERS_URL" "$user_data"
}

test_update_user() {
    print_header "Testing PUT update user"
    read -p "Enter user ID to update: " user_id
    read -p "Enter new first name (press Enter to keep current): " firstName
    read -p "Enter new last name (press Enter to keep current): " lastName
    read -p "Enter new email (press Enter to keep current): " email
    
    local update_data="{"
    local has_data=false
    
    if [ -n "$firstName" ]; then
        update_data+="\"firstName\": \"$firstName\""
        has_data=true
    fi
    
    if [ -n "$lastName" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"lastName\": \"$lastName\""
        has_data=true
    fi
    
    if [ -n "$email" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"email\": \"$email\""
        has_data=true
    fi
    
    update_data+="}"
    
    make_request "PUT" "$USERS_URL/$user_id" "$update_data"
}

test_delete_user() {
    print_header "Testing DELETE user"
    read -p "Enter user ID to delete: " user_id
    make_request "DELETE" "$USERS_URL/$user_id"
}

# Post-related functions
test_get_all_posts() {
    print_header "Testing GET all posts"
    make_request "GET" "$POSTS_URL"
}

test_get_post() {
    print_header "Testing GET post by ID"
    read -p "Enter post ID: " post_id
    make_request "GET" "$POSTS_URL/$post_id"
}

test_create_post() {
    print_header "Testing POST create post"
    read -p "Enter content: " content
    read -p "Enter author ID: " authorId
    
    local post_data=$(cat <<EOF
{
    "content": "$content",
    "authorId": $authorId
}
EOF
)
    make_request "POST" "$POSTS_URL" "$post_data"
}

test_update_post() {
    print_header "Testing PUT update post"
    read -p "Enter post ID to update: " post_id
    read -p "Enter new content: " content
    
    local update_data="{"
    
    if [ -n "$content" ]; then
        update_data+="\"content\": \"$content\""
    fi
    
    update_data+="}"
    
    make_request "PUT" "$POSTS_URL/$post_id" "$update_data"
}

test_delete_post() {
    print_header "Testing DELETE post"
    read -p "Enter post ID to delete: " post_id
    make_request "DELETE" "$POSTS_URL/$post_id"
}

# Follow-related functions
test_get_all_follows() {
    print_header "Testing GET all follows"
    make_request "GET" "$FOLLOWS_URL"
}

test_get_follow() {
    print_header "Testing GET follow by ID"
    read -p "Enter follow ID: " follow_id
    make_request "GET" "$FOLLOWS_URL/$follow_id"
}

test_create_follow() {
    print_header "Testing POST create follow"
    read -p "Enter follower ID: " followerId
    read -p "Enter following ID: " followingId
    
    local follow_data=$(cat <<EOF
{
    "followerId": $followerId,
    "followingId": $followingId
}
EOF
)
    make_request "POST" "$FOLLOWS_URL" "$follow_data"
}

test_delete_follow() {
    print_header "Testing DELETE follow"
    read -p "Enter follow ID to delete: " follow_id
    make_request "DELETE" "$FOLLOWS_URL/$follow_id"
}

test_unfollow_user() {
    print_header "Testing unfollow user"
    read -p "Enter follower ID: " followerId
    read -p "Enter following ID: " followingId
    
    local unfollow_data=$(cat <<EOF
{
    "followerId": $followerId,
    "followingId": $followingId
}
EOF
)
    make_request "DELETE" "$FOLLOWS_URL/unfollow" "$unfollow_data"
}

# Like-related functions
test_get_all_likes() {
    print_header "Testing GET all likes"
    make_request "GET" "$LIKES_URL"
}

test_get_like() {
    print_header "Testing GET like by ID"
    read -p "Enter like ID: " like_id
    make_request "GET" "$LIKES_URL/$like_id"
}

test_create_like() {
    print_header "Testing POST create like"
    read -p "Enter user ID: " userId
    read -p "Enter post ID: " postId
    
    local like_data=$(cat <<EOF
{
    "userId": $userId,
    "postId": $postId
}
EOF
)
    make_request "POST" "$LIKES_URL" "$like_data"
}

test_delete_like() {
    print_header "Testing DELETE like"
    read -p "Enter like ID to delete: " like_id
    make_request "DELETE" "$LIKES_URL/$like_id"
}

test_unlike_post() {
    print_header "Testing unlike post"
    read -p "Enter user ID: " userId
    read -p "Enter post ID: " postId
    
    local unlike_data=$(cat <<EOF
{
    "userId": $userId,
    "postId": $postId
}
EOF
)
    make_request "DELETE" "$LIKES_URL/unlike" "$unlike_data"
}

# Menu functions
show_users_menu() {
    local exit_submenu=false
    
    while [ "$exit_submenu" = false ]; do
        echo -e "\n${GREEN}Users Menu${NC}"
        echo "1. Get all users"
        echo "2. Get user by ID"
        echo "3. Create new user"
        echo "4. Update user"
        echo "5. Delete user"
        echo "6. Back to main menu"
        echo -n "Enter your choice (1-6): "
        read user_choice
        
        case $user_choice in
            1) test_get_all_users ;;
            2) test_get_user ;;
            3) test_create_user ;;
            4) test_update_user ;;
            5) test_delete_user ;;
            6) exit_submenu=true ;;
            *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
        esac
    done
}

show_posts_menu() {
    local exit_submenu=false
    
    while [ "$exit_submenu" = false ]; do
        echo -e "\n${GREEN}Posts Menu${NC}"
        echo "1. Get all posts"
        echo "2. Get post by ID"
        echo "3. Create new post"
        echo "4. Update post"
        echo "5. Delete post"
        echo "6. Back to main menu"
        echo -n "Enter your choice (1-6): "
        read post_choice
        
        case $post_choice in
            1) test_get_all_posts ;;
            2) test_get_post ;;
            3) test_create_post ;;
            4) test_update_post ;;
            5) test_delete_post ;;
            6) exit_submenu=true ;;
            *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
        esac
    done
}

show_follows_menu() {
    local exit_submenu=false
    
    while [ "$exit_submenu" = false ]; do
        echo -e "\n${GREEN}Follows Menu${NC}"
        echo "1. Get all follows"
        echo "2. Get follow by ID"
        echo "3. Follow a user"
        echo "4. Unfollow a user directly"
        echo "5. Delete follow by ID"
        echo "6. Back to main menu"
        echo -n "Enter your choice (1-6): "
        read follow_choice
        
        case $follow_choice in
            1) test_get_all_follows ;;
            2) test_get_follow ;;
            3) test_create_follow ;;
            4) test_unfollow_user ;;
            5) test_delete_follow ;;
            6) exit_submenu=true ;;
            *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
        esac
    done
}

show_likes_menu() {
    local exit_submenu=false
    
    while [ "$exit_submenu" = false ]; do
        echo -e "\n${GREEN}Likes Menu${NC}"
        echo "1. Get all likes"
        echo "2. Get like by ID"
        echo "3. Create new like"
        echo "4. Delete like"
        echo "5. Unlike post"
        echo "6. Back to main menu"
        echo -n "Enter your choice (1-6): "
        read like_choice
        
        case $like_choice in
            1) test_get_all_likes ;;
            2) test_get_like ;;
            3) test_create_like ;;
            4) test_delete_like ;;
            5) test_unlike_post ;;
            6) exit_submenu=true ;;
            *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
        esac
    done
}

# Main function
main() {
    while true; do
        echo -e "\n${GREEN}API Testing Menu${NC}"
        echo "1. Users"
        echo "2. Posts"
        echo "3. Follows"
        echo "4. Likes"
        echo "5. Exit"
        echo -n "Enter your choice (1-5): "
        read main_choice
        
        case $main_choice in
            1) show_users_menu ;;
            2) show_posts_menu ;;
            3) show_follows_menu ;;
            4) show_likes_menu ;;
            5) echo "Exiting..."; exit 0 ;;
            *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
        esac
    done
}

# Run the main function
main 