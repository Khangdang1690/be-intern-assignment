# Base URLs
$USERS_URL = "http://localhost:3000/api/users"
$POSTS_URL = "http://localhost:3000/api/posts"
$FOLLOWS_URL = "http://localhost:3000/api/follows"
$LIKES_URL = "http://localhost:3000/api/likes"

# Colors for output
$GREEN = "Green"
$RED = "Red"
$DEFAULT = "White"

# Function to print section headers
function print_header($title) {
    Write-Host "`n=== $title ===" -ForegroundColor $GREEN
}

# Function to make API requests
function make_request($method, $endpoint, $data) {
    Write-Host "Request: $method $endpoint"
    
    if ($data) {
        Write-Host "Data: $data"
    }
    
    try {
        if ($method -eq "GET") {
            $result = Invoke-RestMethod -Method $method -Uri $endpoint -ContentType "application/json"
            $result | ConvertTo-Json -Depth 10
        }
        else {
            $result = Invoke-RestMethod -Method $method -Uri $endpoint -Body $data -ContentType "application/json"
            $result | ConvertTo-Json -Depth 10
        }
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor $RED
        Write-Host $_.Exception.Response.StatusCode -ForegroundColor $RED
    }
    Write-Host ""
}

# User-related functions
function test_get_all_users {
    print_header "Testing GET all users"
    make_request "GET" $USERS_URL
}

function test_get_user {
    print_header "Testing GET user by ID"
    $user_id = Read-Host "Enter user ID"
    make_request "GET" "$USERS_URL/$user_id"
}

function test_create_user {
    print_header "Testing POST create user"
    $firstName = Read-Host "Enter first name"
    $lastName = Read-Host "Enter last name"
    $email = Read-Host "Enter email"
    
    $user_data = @{
        firstName = $firstName
        lastName = $lastName
        email = $email
    } | ConvertTo-Json
    
    make_request "POST" $USERS_URL $user_data
}

function test_update_user {
    print_header "Testing PUT update user"
    $user_id = Read-Host "Enter user ID to update"
    $firstName = Read-Host "Enter new first name (press Enter to keep current)"
    $lastName = Read-Host "Enter new last name (press Enter to keep current)"
    $email = Read-Host "Enter new email (press Enter to keep current)"
    
    $update_data = @{}
    
    if ($firstName) {
        $update_data.firstName = $firstName
    }
    
    if ($lastName) {
        $update_data.lastName = $lastName
    }
    
    if ($email) {
        $update_data.email = $email
    }
    
    $update_json = $update_data | ConvertTo-Json
    
    make_request "PUT" "$USERS_URL/$user_id" $update_json
}

function test_delete_user {
    print_header "Testing DELETE user"
    $user_id = Read-Host "Enter user ID to delete"
    make_request "DELETE" "$USERS_URL/$user_id"
}

# Post-related functions
function test_get_all_posts {
    print_header "Testing GET all posts"
    make_request "GET" $POSTS_URL
}

function test_get_post {
    print_header "Testing GET post by ID"
    $post_id = Read-Host "Enter post ID"
    make_request "GET" "$POSTS_URL/$post_id"
}

function test_create_post {
    print_header "Testing POST create post"
    $content = Read-Host "Enter content"
    $authorId = Read-Host "Enter author ID"
    
    $post_data = @{
        content = $content
        authorId = [int]$authorId
    } | ConvertTo-Json
    
    make_request "POST" $POSTS_URL $post_data
}

function test_update_post {
    print_header "Testing PUT update post"
    $post_id = Read-Host "Enter post ID to update"
    $content = Read-Host "Enter new content"
    
    $update_data = @{}
    
    if ($content) {
        $update_data.content = $content
    }
    
    $update_json = $update_data | ConvertTo-Json
    
    make_request "PUT" "$POSTS_URL/$post_id" $update_json
}

function test_delete_post {
    print_header "Testing DELETE post"
    $post_id = Read-Host "Enter post ID to delete"
    make_request "DELETE" "$POSTS_URL/$post_id"
}

# Follow-related functions
function test_get_all_follows {
    print_header "Testing GET all follows"
    make_request "GET" $FOLLOWS_URL
}

function test_get_follow {
    print_header "Testing GET follow by ID"
    $follow_id = Read-Host "Enter follow ID"
    make_request "GET" "$FOLLOWS_URL/$follow_id"
}

function test_create_follow {
    print_header "Testing POST create follow"
    $followerId = Read-Host "Enter follower ID"
    $followingId = Read-Host "Enter following ID"
    
    $follow_data = @{
        followerId = [int]$followerId
        followingId = [int]$followingId
    } | ConvertTo-Json
    
    make_request "POST" $FOLLOWS_URL $follow_data
}

function test_delete_follow {
    print_header "Testing DELETE follow"
    $follow_id = Read-Host "Enter follow ID to delete"
    make_request "DELETE" "$FOLLOWS_URL/$follow_id"
}

function test_unfollow_user {
    print_header "Testing unfollow user"
    $followerId = Read-Host "Enter follower ID"
    $followingId = Read-Host "Enter following ID"
    
    $unfollow_data = @{
        followerId = [int]$followerId
        followingId = [int]$followingId
    } | ConvertTo-Json
    
    make_request "DELETE" "$FOLLOWS_URL/unfollow" $unfollow_data
}

# Like-related functions
function test_get_all_likes {
    print_header "Testing GET all likes"
    make_request "GET" $LIKES_URL
}

function test_get_like {
    print_header "Testing GET like by ID"
    $like_id = Read-Host "Enter like ID"
    make_request "GET" "$LIKES_URL/$like_id"
}

function test_create_like {
    print_header "Testing POST create like"
    $userId = Read-Host "Enter user ID"
    $postId = Read-Host "Enter post ID"
    
    $like_data = @{
        userId = [int]$userId
        postId = [int]$postId
    } | ConvertTo-Json
    
    make_request "POST" $LIKES_URL $like_data
}

function test_delete_like {
    print_header "Testing DELETE like"
    $like_id = Read-Host "Enter like ID to delete"
    make_request "DELETE" "$LIKES_URL/$like_id"
}

function test_unlike_post {
    print_header "Testing unlike post"
    $userId = Read-Host "Enter user ID"
    $postId = Read-Host "Enter post ID"
    
    $unlike_data = @{
        userId = [int]$userId
        postId = [int]$postId
    } | ConvertTo-Json
    
    make_request "DELETE" "$LIKES_URL/unlike" $unlike_data
}

# Main program structure
function main {
    while ($true) {
        # Show main menu
        Write-Host "`nAPI Testing Menu" -ForegroundColor $GREEN
        Write-Host "1. Users"
        Write-Host "2. Posts"
        Write-Host "3. Follows"
        Write-Host "4. Likes"
        Write-Host "5. Exit"
        $main_choice = Read-Host "Enter your choice (1-5)"
        
        switch ($main_choice) {
            "1" { show_users_menu }
            "2" { show_posts_menu }
            "3" { show_follows_menu }
            "4" { show_likes_menu }
            "5" { 
                Write-Host "Exiting..."
                exit 
            }
            default { Write-Host "Invalid choice. Please try again." -ForegroundColor $RED }
        }
    }
}

function show_users_menu {
    $exit_submenu = $false
    
    while (-not $exit_submenu) {
        Write-Host "`nUsers Menu" -ForegroundColor $GREEN
        Write-Host "1. Get all users"
        Write-Host "2. Get user by ID"
        Write-Host "3. Create new user"
        Write-Host "4. Update user"
        Write-Host "5. Delete user"
        Write-Host "6. Back to main menu"
        $choice = Read-Host "Enter your choice (1-6)"
        
        switch ($choice) {
            "1" { test_get_all_users }
            "2" { test_get_user }
            "3" { test_create_user }
            "4" { test_update_user }
            "5" { test_delete_user }
            "6" { $exit_submenu = $true }
            default { Write-Host "Invalid choice. Please try again." -ForegroundColor $RED }
        }
    }
}

function show_posts_menu {
    $exit_submenu = $false
    
    while (-not $exit_submenu) {
        Write-Host "`nPosts Menu" -ForegroundColor $GREEN
        Write-Host "1. Get all posts"
        Write-Host "2. Get post by ID"
        Write-Host "3. Create new post"
        Write-Host "4. Update post"
        Write-Host "5. Delete post"
        Write-Host "6. Back to main menu"
        $choice = Read-Host "Enter your choice (1-6)"
        
        switch ($choice) {
            "1" { test_get_all_posts }
            "2" { test_get_post }
            "3" { test_create_post }
            "4" { test_update_post }
            "5" { test_delete_post }
            "6" { $exit_submenu = $true }
            default { Write-Host "Invalid choice. Please try again." -ForegroundColor $RED }
        }
    }
}

function show_follows_menu {
    $exit_submenu = $false
    
    while (-not $exit_submenu) {
        Write-Host "`nFollows Menu" -ForegroundColor $GREEN
        Write-Host "1. Get all follows"
        Write-Host "2. Get follow by ID"
        Write-Host "3. Follow a user"
        Write-Host "4. Unfollow a user directly"
        Write-Host "5. Delete follow by ID"
        Write-Host "6. Back to main menu"
        $choice = Read-Host "Enter your choice (1-6)"
        
        switch ($choice) {
            "1" { test_get_all_follows }
            "2" { test_get_follow }
            "3" { test_create_follow }
            "4" { test_unfollow_user }
            "5" { test_delete_follow }
            "6" { $exit_submenu = $true }
            default { Write-Host "Invalid choice. Please try again." -ForegroundColor $RED }
        }
    }
}

function show_likes_menu {
    $exit_submenu = $false
    
    while (-not $exit_submenu) {
        Write-Host "`nLikes Menu" -ForegroundColor $GREEN
        Write-Host "1. Get all likes"
        Write-Host "2. Get like by ID"
        Write-Host "3. Create new like"
        Write-Host "4. Delete like"
        Write-Host "5. Unlike post"
        Write-Host "6. Back to main menu"
        $choice = Read-Host "Enter your choice (1-6)"
        
        switch ($choice) {
            "1" { test_get_all_likes }
            "2" { test_get_like }
            "3" { test_create_like }
            "4" { test_delete_like }
            "5" { test_unlike_post }
            "6" { $exit_submenu = $true }
            default { Write-Host "Invalid choice. Please try again." -ForegroundColor $RED }
        }
    }
}

# Start the program
main 