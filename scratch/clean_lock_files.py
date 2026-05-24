import os

search_dir = "z:/cfq_sgc/SGC_CALFERQUIM"
deleted_count = 0

for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.startswith("~$"):
            path = os.path.join(root, file)
            try:
                os.remove(path)
                print(f"Removed lock file: {os.path.relpath(path, search_dir)}")
                deleted_count += 1
            except Exception as e:
                print(f"Failed to remove {file}: {e}")

print(f"\nTotal lock files removed: {deleted_count}")
