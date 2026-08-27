---
title: Linux 与 WSL2 常见小问题
date: 2026-08-27 12:30:00
categories:
  - Linux
tags:
  - Linux
  - WSL2
  - 排错
excerpt: 记录 WSL2 和 Linux 开发环境中获取网关、排查端口、磁盘和进程问题的常用命令。
---

## 在 WSL2 中获取 Windows 主机地址

最可靠的方式是读取默认路由的网关地址：

```bash
ip route show default | awk '{print $3}'
```

也可以查看 WSL2 使用的 DNS 地址：

```bash
cat /etc/resolv.conf
grep -oP '(?<=nameserver\s).*' /etc/resolv.conf
```

默认路由会随网络环境变化，因此不要把某一次输出的 IP 硬编码到脚本中。

## 排查端口占用

```bash
ss -lntp
ss -lntp | grep ':8080'
lsof -i :8080
```

查看到进程后，先确认它是否属于当前开发服务，再决定是否停止：

```bash
ps aux | grep '[n]ode'
kill <PID>
```

优先使用 `kill` 发送可处理的终止信号，只有进程无法退出时才考虑更强的信号。

## 磁盘和目录占用

```bash
df -h
du -sh ./* 2>/dev/null | sort -h
```

容器、构建目录和包管理器缓存经常是空间增长的来源。删除前先确认路径，避免误删项目源代码。

## 查看日志和环境变量

```bash
journalctl -u nginx --since '1 hour ago'
printenv | sort
echo "$PATH"
```

WSL2 网络或挂载状态异常时，可以在 PowerShell 中执行：

```powershell
wsl.exe --shutdown
```

然后重新打开发行版。该命令会停止所有 WSL 实例，执行前应保存未写入磁盘的工作。

## 小结

排错时先确认现象，再收集进程、端口、日志和磁盘信息；每一步只改变一个变量，并记录执行结果，通常比直接重启或强制杀进程更容易定位问题。
