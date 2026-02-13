---
description: Git workflow and commit practices for AoWoW project
activation_mode: manual
---

# Git Workflow

<commit_practices>
- Write clear, descriptive commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issue numbers when applicable (#123)
- Keep commits focused on a single change
- Avoid committing debug code or temporary files
- Test changes before committing
</commit_practices>

<branch_naming>
- Use descriptive branch names
- Format: `feature/description`, `bugfix/description`, `docs/description`
- Use lowercase and hyphens
- Examples: `feature/enchantment-search`, `bugfix/item-cache-issue`
</branch_naming>

<pull_request_guidelines>
- Provide clear description of changes
- Reference related issues
- Include testing notes
- Request review from team members
- Address review comments promptly
- Squash commits before merging if needed
</pull_request_guidelines>

<code_review>
- Review for code quality and standards compliance
- Check for security issues
- Verify database queries are optimized
- Ensure proper error handling
- Check for localization support
- Verify no debug code is included
</code_review>

<merge_strategy>
- Merge to main/master only after review approval
- Use squash merge for feature branches to keep history clean
- Keep main branch stable and deployable
- Tag releases with version numbers
</merge_strategy>
