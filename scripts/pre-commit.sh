#!/bin/bash

# Pre-commit verification script
# Runs all checks before committing to ensure CI/CD will pass

set -e  # Exit on any error

echo "=========================================="
echo "  Pre-Commit Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Format check and fix
echo -e "${YELLOW}[1/5] Checking and fixing formatting...${NC}"
npm run format
# Add formatted files to staging area
if ! git diff --quiet; then
    echo -e "${YELLOW}Adding formatted files to staging area...${NC}"
    git add -A
    echo -e "${GREEN}✓ Formatted files staged${NC}"
fi
echo -e "${GREEN}✓ Formatting complete${NC}"
echo ""

# Step 2: Lint check and fix
echo -e "${YELLOW}[2/5] Running linter...${NC}"
npm run lint:fix
# Add linted files to staging area
if ! git diff --quiet; then
    echo -e "${YELLOW}Adding linted files to staging area...${NC}"
    git add -A
    echo -e "${GREEN}✓ Linted files staged${NC}"
fi
echo -e "${GREEN}✓ Linting complete${NC}"
echo ""

# Step 3: Verify formatting
echo -e "${YELLOW}[3/5] Verifying formatting...${NC}"
npm run format:check
echo -e "${GREEN}✓ Format verification passed${NC}"
echo ""

# Step 4: Run tests
echo -e "${YELLOW}[4/5] Running tests...${NC}"
npm test
echo -e "${GREEN}✓ All tests passed${NC}"
echo ""

# Step 5: Git status
echo -e "${YELLOW}[5/5] Git status...${NC}"
git status --short
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}  All checks passed! ✓${NC}"
echo "=========================================="
echo ""
echo "Your code is ready to commit!"
echo ""
echo "Suggested commands:"
echo "  git add ."
echo "  git commit -m \"your message\""
echo "  git push origin main"
echo ""
