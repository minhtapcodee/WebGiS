<?php
include('conn.php'); // Include database connection  

// Check if 'ld' is set in the GET request  
if (isset($_GET['ld'])) {
    $thua = $_GET['ld'];
    // Convert the input to lowercase  
    $name = strtolower($thua);

    // SQL query to select data from thuadatdaydu3new
    $query = "SELECT sothua, text1, dientich, st_x(ST_Centroid(geom)) AS x, st_y(ST_Centroid(geom)) AS y   
              FROM public.thuadatdaydu3new   
              WHERE LOWER(text1) LIKE '%$name%';";

    $result = pg_query($conn, $query); // Execute the query  
    $tong_so_ket_qua = pg_num_rows($result); // Get the number of results  

    // Check if there are any results  
    if ($tong_so_ket_qua > 0) {
        while ($rs = pg_fetch_array($result, null, PGSQL_ASSOC)) {
            // Create a link for each result  
            $link = "<a href='javascript:void(0);' onclick='di_den_diem(" . $rs['x'] . ", " . $rs['y'] . ")'>here</a>";
            // Print the result (đồng bộ với định dạng trong main.js)
            print("Loại đất: " . $rs['text1'] . " | Số thửa: " . $rs['sothua'] . " | Diện tích: " . $rs['dientich'] . " m² " . $link . "<br>");
        }
    } else {
        print("NOT FOUND");
    }
} else {
    echo "NOT FOUND";
}
?>