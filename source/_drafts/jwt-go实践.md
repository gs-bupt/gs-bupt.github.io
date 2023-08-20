---
title: jwt-go实践
tags:
---
## 介绍

JSON Web Token（JWT）是一个开放标准（RFC 7519），它定义了一种方式，用于在各方之间安全地将信息作为 JSON 对象传输。由于此信息是经过数字签名的，因此可以被验证和信任。可以使用秘密（使用 HMAC 算法）或使用 RSA 或 ECDSA 的公钥/私钥对对 JWT 进行签名。

## 下载依赖包

```go
go get -u github.com/dgrijalva/jwt-go
```

## 生成token

使用 jwt-go 库生成 token，我们需要自定义Claims，通过jwt传输的数据。假如我们需要传输 ID 和 Username，我们可以定义 Claims 结构体，其中包含 ID 和 Username 字段，还有在 jwt-go 包预定义的 jwt.StandardClaims。

```go
type Claims struct {
    Username string 
    ID       int64 
    jwt.StandardClaims
}
```

jwt.StandardClaims包含以下字段:

```go
type StandardClaims struct {
    Audience  string `json:"aud,omitempty"`
    ExpiresAt int64  `json:"exp,omitempty"`
    Id        string `json:"jti,omitempty"`
    IssuedAt  int64  `json:"iat,omitempty"`
    Issuer    string `json:"iss,omitempty"`
    NotBefore int64  `json:"nbf,omitempty"`
    Subject   string `json:"sub,omitempty"`
}
```

具体生成token代码如下:

```go
func GenerateToken(id int64, username string) (string, error) {
    expireTime := time.Now().Add(config.TokenExpireDuration)

    claims := Claims{
        username,
        id,
        jwt.StandardClaims{
            ExpiresAt: expireTime.Unix(),
            Issuer:    "gs",
        },
    }

    tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    token, err := tokenClaims.SignedString(jwtSecret)

    return token, err
}
```

GenerateToken函数是将传入的id与username，放入自定义的Claims，并设置过期时间和签发者之后进行加密，最后返回加密后的token字符串。

在GenerateToken函数中，涉及到jwt库中的两个函数

1. `func jwt.NewWithClaims(method jwt.SigningMethod, claims jwt.Claims) *jwt.Token`

    method对应着SigningMethodHMAC struct{}，其包含SigningMethodHS256、SigningMethodHS384、SigningMethodHS512三种crypto.Hash加密算法的方案。

    claims包含自定义类型和 StandardClaim，StandardClaim 嵌入在自定义类型中，以方便对标准声明进行编码，解析和验证。

2. `func (*jwt.Token).SignedString(key interface{}) (string, error)`

    根据传入的空接口类型参数 key，返回完整的签名令牌。

## 解析token

```go
func ParseToken(token string) (*Claims, error) {
    tokenClaims, err := jwt.ParseWithClaims(token, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })

    if tokenClaims != nil {
        if claims, ok := tokenClaims.Claims.(*Claims); ok && tokenClaims.Valid {
            return claims, nil
        }
    }

    return nil, err
}
```

ParseToken函数是将传入的token字符串进行解密，还原出原先的Claims便可以读取到存储在token字符串中的数据。要记住，加密和解密时使用的JwtSecret不能泄露。

## 