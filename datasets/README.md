# SkillBridge AI Datasets

This directory serves as the documentation reference for datasets imported into SkillBridge AI.
Do NOT place raw dataset CSV files directly into the repository `src` or `data` folders.

## Architecture

SkillBridge AI is a dataset-driven platform. Datasets are uploaded via the Admin Portal (`/admin/datasets`) and piped into a Supabase PostgreSQL database. 

1. **Upload**: Datasets are uploaded via the UI.
2. **Parsing**: The platform inspects the CSV/JSON columns.
3. **Mapping Layer**: You explicitly map dataset columns to canonical SkillBridge properties (e.g. `role_name`, `skills`).
4. **Skill Normalization**: Skills are routed through `skillNormalizationService` to convert strings like "PYTHON PROGRAMMING" to a canonical "Python" skill ID.
5. **Storage**: The data is inserted into core tables (`profiles`, `skills`, `student_skills`, `industry_requirements`, etc.).
6. **Provenance**: Every import creates an `import_batches` and `dataset_sources` record so that every row can be traced back to its origin dataset.

## Supported Formats

Currently, the UI importer supports:
- **CSV** (Comma Separated Values)

## Adding a New Dataset

1. Log in to the Admin Portal (`/admin/datasets`).
2. Select the **Target Entity** (e.g. Industry Role Requirements).
3. Upload your CSV.
4. On the Inspection Screen, verify that the CSV columns are detected correctly.
5. On the Mapping Screen, select which CSV column matches the target properties.
6. Run the import.
7. Review the import summary for skipped or invalid records.

## Troubleshooting Imports

- **Missing Columns**: Ensure your CSV has headers on the first row.
- **Duplicate Records**: The import engine will handle duplicates based on the target table's unique constraints.
- **Failed Rows**: Check the summary for invalid row counts. Usually this is due to empty fields for required database columns.

## Database Tables

- `dataset_sources`: Metadata about the dataset (name, license, etc).
- `import_batches`: Logs of specific upload events, keeping track of how many rows succeeded vs failed.
- Primary tables (`industry_requirements`, `skills`, etc) have an `import_batch_id` column to trace back to the import log.
