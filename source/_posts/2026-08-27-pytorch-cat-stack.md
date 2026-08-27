---
title: PyTorch 两个常用法宝：torch.cat 与 torch.stack
date: 2026-08-27 13:00:00
categories:
  - Python
  - 深度学习
tags:
  - PyTorch
  - 张量
  - 深度学习
excerpt: 通过形状示例理解 torch.cat 和 torch.stack 的差异、使用场景与常见错误。
---

## 为什么容易混淆

`torch.cat` 和 `torch.stack` 都可以把多个张量组合起来，但它们对维度的处理不同：

- `torch.cat` 沿已有维度拼接，不会增加维度；
- `torch.stack` 在指定位置插入一个新维度，要求所有输入形状完全一致。

## torch.cat：沿已有维度拼接

```python
import torch

a = torch.tensor([[1, 2], [3, 4]])  # [2, 2]
b = torch.tensor([[5, 6]])         # [1, 2]

rows = torch.cat((a, b), dim=0)     # [3, 2]
cols = torch.cat((a, a), dim=1)     # [2, 4]
```

除 `dim` 外，其他维度必须相同。它适合合并 batch、序列片段或通道：例如把两个 `[batch, features]` 张量沿 `dim=0` 合并成更大的 batch。

## torch.stack：创建新的维度

```python
x = torch.tensor([1, 2, 3])
y = torch.tensor([4, 5, 6])

stacked = torch.stack((x, y), dim=0)  # [2, 3]
stacked = torch.stack((x, y), dim=1)  # [3, 2]
```

`stack` 可以理解为先给每个张量 `unsqueeze(dim)`，再进行拼接。因此每个输入都必须是同样的形状。它常用于把多次采样、多个时间步或多个模型输出组织成一个新维度。

## 如何选择

假设有 8 个形状为 `[3, 224, 224]` 的图像张量：

- 用 `torch.stack(images, dim=0)` 得到 `[8, 3, 224, 224]`，适合组成 batch；
- 如果已有两个 batch，形状分别是 `[8, 3, 224, 224]` 和 `[4, 3, 224, 224]`，用 `torch.cat((batch1, batch2), dim=0)` 得到 `[12, 3, 224, 224]`。

遇到维度错误时，先打印 `tensor.shape`，再确认拼接维度和其他维度是否符合要求。不要只通过 `reshape` 强行“修复”形状，先确认数据语义是否正确。
