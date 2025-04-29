# Base URLs
$USERS_URL = "http://localhost:3000/api/users"
$POSTS_URL = "http://localhost:3000/api/posts"

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
    
    if ($method -eq "GET") {
        $result = Invoke-RestMethod -Method $method -Uri $endpoint -ContentType "application/json"
        $result | ConvertTo-Json -Depth 10
    }
    else {
        $result = Invoke-RestMethod -Method $method -Uri $endpoint -Body $data -ContentType "application/json"
        $result | ConvertTo-Json -Depth 10
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

# Submenu functions
function show_users_menu {
    Write-Host "`nUsers Menu" -ForegroundColor $GREEN
    Write-Host "1. Get all users"
    Write-Host "2. Get user by ID"
    Write-Host "3. Create new user"
    Write-Host "4. Update user"
    Write-Host "5. Delete user"
    Write-Host "6. Back to main menu"
    $choice = Read-Host "Enter your choice (1-6)"
    return $choice
}

function show_posts_menu {
    Write-Host "`nPosts Menu" -ForegroundColor $GREEN
    Write-Host "1. Get all posts"
    Write-Host "2. Get post by ID"
    Write-Host "3. Create new post"
    Write-Host "4. Update post"
    Write-Host "5. Delete post"
    Write-Host "6. Back to main menu"
    $choice = Read-Host "Enter your choice (1-6)"
    return $choice
}

# Main menu
function show_main_menu {
    Write-Host "`nAPI Testing Menu" -ForegroundColor $GREEN
    Write-Host "1. Users"
    Write-Host "2. Posts"
    Write-Host "3. Exit"
    $choice = Read-Host "Enter your choice (1-3)"
    return $choice
}

# Main loop
while ($true) {
    $main_choice = show_main_menu
    
    switch ($main_choice) {
        "1" {
            while ($true) {
                $user_choice = show_users_menu
                
                switch ($user_choice) {
                    "1" { test_get_all_users }
                    "2" { test_get_user }
                    "3" { test_create_user }
                    "4" { test_update_user }
                    "5" { test_delete_user }
                    "6" { break }
                    default { Write-Host "Invalid choice. Please try again." }
                }
            }
        }
        "2" {
            while ($true) {
                $post_choice = show_posts_menu
                
                switch ($post_choice) {
                    "1" { test_get_all_posts }
                    "2" { test_get_post }
                    "3" { test_create_post }
                    "4" { test_update_post }
                    "5" { test_delete_post }
                    "6" { break }
                    default { Write-Host "Invalid choice. Please try again." }
                }
            }
        }
        "3" {
            Write-Host "Exiting..."
            exit
        }
        default {
            Write-Host "Invalid choice. Please try again."
        }
    }
} 