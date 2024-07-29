import os

directory_path = '/home/----/Documents/sdz/'

files = os.listdir(directory_path)

for file_name in files:
    if os.path.isfile(os.path.join(directory_path, file_name)):
        new_name = file_name.split('-', 1)[1].replace('-', ' ').capitalize()
        file_path = os.path.join(directory_path, file_name)
        new_file_path = os.path.join(directory_path, new_name)
        os.rename(file_path, new_file_path)
