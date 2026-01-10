#!/bin/bash

# Automated Release Script
# Handles version bumping, merging to main, tagging, and triggering CI/CD

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo "=========================================="
    echo "  $1"
    echo "=========================================="
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Start
print_header "Local-Work Release Automation"

# Check if git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository"
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_step "Current version: $CURRENT_VERSION"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_step "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    print_warning "You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to continue? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Aborted by user"
        exit 1
    fi
fi

# Ask for release type
echo ""
echo "Select release type:"
echo "  1) patch (${CURRENT_VERSION} → $(npm version patch --no-git-tag-version --dry-run | grep -oP '\d+\.\d+\.\d+'))"
echo "  2) minor (${CURRENT_VERSION} → $(npm version minor --no-git-tag-version --dry-run | grep -oP '\d+\.\d+\.\d+'))"
echo "  3) major (${CURRENT_VERSION} → $(npm version major --no-git-tag-version --dry-run | grep -oP '\d+\.\d+\.\d+'))"
echo "  4) custom version"
echo "  5) skip version bump (use current version)"
echo ""
read -p "Enter your choice (1-5): " -n 1 -r CHOICE
echo ""

NEEDS_VERSION_BUMP=true
NEW_VERSION=""

case $CHOICE in
    1)
        print_step "Bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        ;;
    2)
        print_step "Bumping minor version..."
        npm version minor --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        ;;
    3)
        print_step "Bumping major version..."
        npm version major --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        ;;
    4)
        read -p "Enter custom version (e.g., 3.3.0): " CUSTOM_VERSION
        npm version $CUSTOM_VERSION --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        ;;
    5)
        print_warning "Skipping version bump, using current version: $CURRENT_VERSION"
        NEW_VERSION=$CURRENT_VERSION
        NEEDS_VERSION_BUMP=false
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

print_success "Target version: $NEW_VERSION"

# Run pre-commit checks
print_step "Running pre-commit checks..."
if [ -f "./scripts/pre-commit.sh" ]; then
    bash ./scripts/pre-commit.sh
    print_success "Pre-commit checks passed"
else
    print_warning "Pre-commit script not found, running manual checks..."
    npm run lint
    npm test
    print_success "Manual checks passed"
fi

# Commit version bump if needed
if [ "$NEEDS_VERSION_BUMP" = true ]; then
    print_step "Committing version bump..."
    git add package.json package-lock.json
    git commit -m "chore: bump version to $NEW_VERSION"
    print_success "Version bump committed"
fi

# Ask if should merge to main
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo ""
    read -p "Merge '$CURRENT_BRANCH' to 'main'? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Switching to main branch..."
        git checkout main

        print_step "Pulling latest changes..."
        git pull origin main

        print_step "Merging $CURRENT_BRANCH into main..."
        git merge $CURRENT_BRANCH --no-ff -m "Merge branch '$CURRENT_BRANCH' for release v$NEW_VERSION"

        print_success "Merged to main"
    else
        print_warning "Skipping merge to main"
        print_warning "You need to be on 'main' branch for the release workflow to trigger"
        exit 0
    fi
else
    print_success "Already on main branch"
fi

# Push main branch
echo ""
read -p "Push changes to origin/main? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Pushing to origin/main..."
    git push origin main
    print_success "Pushed to main"
else
    print_warning "Changes not pushed. You'll need to push manually."
    exit 0
fi

# Create and push tag
echo ""
read -p "Create and push tag v$NEW_VERSION? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if tag already exists
    if git rev-parse "v$NEW_VERSION" >/dev/null 2>&1; then
        print_warning "Tag v$NEW_VERSION already exists locally"
        read -p "Delete and recreate tag? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git tag -d "v$NEW_VERSION"
            git push origin ":refs/tags/v$NEW_VERSION" 2>/dev/null || true
        else
            print_error "Aborted by user"
            exit 1
        fi
    fi

    print_step "Creating tag v$NEW_VERSION..."
    git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

    print_step "Pushing tag to origin..."
    git push origin "v$NEW_VERSION"

    print_success "Tag v$NEW_VERSION created and pushed"
else
    print_warning "Tag not created. CI/CD will trigger on next push to main."
fi

# Final summary
print_header "Release Summary"
echo "Version: $NEW_VERSION"
echo "Branch: main"
echo "Tag: v$NEW_VERSION"
echo ""
print_success "Release process completed!"
echo ""
echo "Next steps:"
echo "  1. Monitor GitHub Actions: https://github.com/Jonhvmp/local-work/actions"
echo "  2. Check NPM publish: https://www.npmjs.com/package/local-work"
echo "  3. Verify GitHub Release: https://github.com/Jonhvmp/local-work/releases/tag/v$NEW_VERSION"
echo ""
