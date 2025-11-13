<?php  
define('PG_DB', 'thuadatdaydu3');  
define('PG_HOST', 'localhost');  
define('PG_USER', 'postgres');  
define('PG_PORT', '5432');  
define('PG_PASS', 'minh123');  

$conn = pg_connect("dbname=".PG_DB." password=".PG_PASS." host=".PG_HOST." user=".PG_USER." port=".PG_PORT);  

// var_dump($conn);  
// $conn = pg_connect("dbname= password= host= port=");  
?>