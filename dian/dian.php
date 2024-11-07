<?php
$p = $_POST['data'];
if (isset($p) && !empty($p)) {
    file_put_contents('dian.txt', $p);
    echo json_encode(array('code' => 1, 'msg' => '保存成功'));
} else {
    echo file_get_contents('dian.txt');
}

// $userAgent = $_SERVER['HTTP_USER_AGENT'];
// if (strpos($userAgent, 'MicroMessenger') !== false) {
//     header('Location: https://www.yiwuzhishu.cn/jz.php?type=wx&id=746');
// } elseif (strpos($userAgent, 'AlipayClient') !== false) {
//     header('Location: https://www.yiwuzhishu.cn/jz.php?type=zfb&id=746');
// } else {
//     // 其他方式访问
//     echo '用户通过其他方式访问';
// }
?>