@echo off
rem studentmap 一键启动（双击运行）：开发服务器 + 班级服务器，各自独立窗口常驻
rem 课堂正式使用时：先 npm run build，学生访问 http://<本机IP>:8788 即可（dist 由班级服务器托管）
cd /d E:\studentmap
start "studentmap-开发服务器(5173)" cmd /k "npm run dev"
start "studentmap-班级服务器(8788)" cmd /k "npm run class-server"
echo 已在两个新窗口中启动服务。关闭对应窗口即停止对应服务。
pause
