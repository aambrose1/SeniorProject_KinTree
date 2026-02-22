# Contributing Guidelines

This document explains the workflow standards for contributing to the KinTree project.  
Following these guidelines will help keep our codebase consistent and organized.

## Table of Contents
1. [Issues](#issues)
2. [Branch Naming](#branch_naming)
3. [Commit Messages](#commit_messages)
4. [Pull Requests](#pull_requests)

---
## Issues
Each feature, bug, or task should have its own GitHub issue.

When creating an issue:

- Title: Short and specific (e.g., “Add login form validation”, "Refactor navigation component")
- Description:
    * What needs to be done
    * When it happens
- Labels: Use tags like `frontend`, `backend`, `bug`, etc.
- Assignee: Assign to the person(s) responsible.

---
## Branch Naming
Create a new branch for each task from main.

When creating a branch:

Format: `<type>/<short-description>` <br>
Types:
- feat → new feature
- fix → bug fix
- refactor → code improvement
- docs → documentation update
- test → testing work

Examples:
- feat/login-validation
- fix/db-connection
- refactor/user-model

---
## Commit Messages
Write concise commit messages that describe the change. <br>
Always commit in *small focused increments* instead of *large and broad*.

Format: `<type>: <short summary>` <br>
Types:
- feat → new feature
- fix → bug fix
- refactor → code improvement
- docs → documentation update
- test → testing work

Examples:
- feat: add media upload feature
     * integrated AWS S3 for image storage
     * added upload button to profile page

 ---
## Pull Requests (PRs)
When your branch is ready, open a pull request into main.

When you're opening a new PR:

### PR Template:
- Title: Add a short summary
- Summary: Explain what was done and why.
- Changes:
     * Added X feature
     * Fixed Y issue
- Link an issue that it addresses/closes

### PR Guidelines:
- Pull the latest version of main.
- Test locally and confirm everything runs correctly.
- Remove any unused code, debug statements, or console logs.

### PR Review and Approval
- Do not merge your own PR, assign reviewer(s) to your PR.
- At least one team member must review, comment, and approve before merging.

     * Before merging, reviewers should verify:
          * Code runs without unexpected errors.
          * PR does what it set out to do without breaking other existing functionalities.

