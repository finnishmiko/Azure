<?php
echo ("start... ");

// -------------- SQLSRV LOAD -------------------------------------------

if (!extension_loaded("sqlsrv")) {
  die("sqlsrv extension not loaded");
 }

#OpenConnection();
ReadData();

function OpenConnection()
{
    echo ("opening... ");
    try
    {
        $serverName = "tcp:<SQL server name>.database.windows.net,1433";
        #$serverName = "vattusqlsrv";
        $connectionOptions = array("Database"=>"<SQL DB name>",
                                  "Uid"=>"<user name>@<SQL server name>",
                                  "PWD"=>"<password>");
        $conn = sqlsrv_connect($serverName, $connectionOptions);
        if($conn == false)
            die(print_r(sqlsrv_errors(), true));
        return $conn;
    }
    catch(Exception $e)
    {
        echo("Error!");
    }
}


function ReadData()
{
    try
    {
        $conn = OpenConnection();
        $tsql = "SELECT * FROM <SQL DB table name>";
        $getProducts = sqlsrv_query($conn, $tsql);
        if ($getProducts == FALSE)
            die(print_r(sqlsrv_errors(), true));
        $productCount = 0;
        while($row = sqlsrv_fetch_array($getProducts, SQLSRV_FETCH_ASSOC))
        {
            print_r($row);
            echo("<br/>");
            $productCount++;
            if($productCount == 10) die();
        }
        sqlsrv_free_stmt($getProducts);
        sqlsrv_close($conn);
    }
    catch(Exception $e)
    {
        echo("Error!");
    }
}
