import pymssql
conn = pymssql.connect(server='<SQL server name>.database.windows.net', user='<Username>@<SQL server name>', password='<Password>', database='<DB name>')  

cursor = conn.cursor()  
cursor.execute('SELECT * FROM <table name>;')  
row = cursor.fetchone()
counter = 0
while row:  
    print row      
    row = cursor.fetchone()
    counter +=1
    if counter == 10:
        break
