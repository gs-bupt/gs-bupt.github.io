---
title: linux小问题
tags:
---

1. 在wsl2中获取windows的ip地址

```bash
cat /etc/resolv.conf
或者
grep -oP '(?<=nameserver\ ).*' /etc/resolv.conf
```
