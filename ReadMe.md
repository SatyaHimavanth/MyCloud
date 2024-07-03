To run this program you need to have Python (version 3 or above preferred) installed and configured in your system.

Steps to host your folder:

Step 1:
    After installing and adding Env variables of python, pip install required libraries by using the below command
    pip install Flask send2trash

Step 2:
    Open the project folder in vs code   

Step 2:
    assign your folder path to base_directory on "app.py" in "line 33"
    for example, if you want to host a movies folder in D drive do this
    base_directory = "D:\\Movies"

Step 3:
    run the project using the below code
    py app.py

Step 4:
    click on the URL displayed in the terminal to view your folder live.
    The same URL can be used to access the files on any device when connected to the same network.


To start hosting as soon as your system starts:
create a .bat file with below two lines of code

@echo off
path\to\python.exe path\to\app.py

Example:
C:\Users\hp\AppData\Local\Programs\Python\Python311\python.exe D:\myhosting_flask\app.py

Now save the file with any name ex: onstart_cloud.bat
Press win+R and enter   shell:startup
Place the .bat file in that folder
