#!/bin/bash

# Branch Testing Script for Zipli
# This script helps you test different branches safely

set -e

ORIGINAL_BRANCH=$(git branch --show-current)
PROJECT_DIR="/Users/rhiday/Desktop/Zipli/zipli v3"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}==== $1 ====${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to safely switch to a branch
test_branch() {
    local remote_branch=$1
    local local_branch=$2
    local description=$3
    
    print_header "Testing Branch: $remote_branch"
    echo "Description: $description"
    
    # Create or switch to testing branch
    if git show-ref --verify --quiet refs/heads/$local_branch; then
        print_warning "Branch $local_branch already exists. Deleting and recreating..."
        git branch -D $local_branch 2>/dev/null || true
    fi
    
    git checkout -b $local_branch $remote_branch
    print_success "Switched to branch: $local_branch"
    
    echo -e "\n${YELLOW}Current branch commits (last 5):${NC}"
    git log --oneline -5
    
    echo -e "\n${YELLOW}Files changed from main:${NC}"
    git diff --name-only main...HEAD | head -10
    
    echo -e "\n${GREEN}Ready to test! Commands:${NC}"
    echo "  pnpm install  # Install dependencies"
    echo "  pnpm dev      # Start development server"
    echo "  pnpm test     # Run tests"
    echo -e "\n${YELLOW}Press any key to continue to next branch, or Ctrl+C to stop here...${NC}"
    read -n 1 -s
}

# Function to return to original branch
cleanup() {
    print_header "Cleaning Up"
    git checkout $ORIGINAL_BRANCH
    print_success "Returned to original branch: $ORIGINAL_BRANCH"
    
    # Optionally delete test branches
    echo -e "\n${YELLOW}Delete test branches? (y/n):${NC}"
    read -n 1 -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo
        git branch -D test-voice-input 2>/dev/null || true
        git branch -D test-staging 2>/dev/null || true  
        git branch -D test-save-wip 2>/dev/null || true
        print_success "Deleted test branches"
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT

print_header "Branch Testing Started"
echo "Original branch: $ORIGINAL_BRANCH"
echo "This script will help you test each branch safely."
echo -e "\n${YELLOW}Press Enter to start...${NC}"
read

# Test each branch
test_branch "origin/feature/voice-input" "test-voice-input" "Voice input UI with circular button styling"

test_branch "origin/staging" "test-staging" "Development environment configuration"

test_branch "origin/feature/save-wip" "test-save-wip" "Enhanced donation flow, allergen handling, tests, and UI improvements"

print_header "All branches tested!"
echo -e "${GREEN}You've now seen all the branches. Check your notes to compare features.${NC}"