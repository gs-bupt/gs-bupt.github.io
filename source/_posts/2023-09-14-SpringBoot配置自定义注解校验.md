---
title: SpringBoot配置自定义注解校验
categories:
  - SpringBoot
excerpt: 摘要
date: 2023-09-14 23:13:24
tags:
  - Spring
  - SpringBoot
---

### 1. 前期准备

依赖

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.15</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
<dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

```

### 2. 定义注解

```java
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MobileValidator.class)
public @interface Mobile {
    boolean required() default true;

    String message() default "手机号码格式错误";
    
    String regexp() default MobileRegExp.MOBILE_REG_EXP;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

`@Retention(RetentionPolicy.RUNTIME)`：`RetentionPolicy.RUNTIME` 表示该注解应该在运行时保留，以便可以通过反射在运行时访问注解信息。

`@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER})`：用于指定可以标记哪些程序元素（元素级别的注解）。可以用于标记方法（METHOD）、字段（FIELD）、注解类（ANNOTATION_TYPE）、构造函数（CONSTRUCTOR）和参数（PARAMETER）。

`@Constraint(validatedBy = MobileValidator.class)`用于自定义验证器，指示该注解与`MobileValidator.class`关联，即`MobileValidator.class`将执行与此注解相关的验证逻辑。

`message()`定义了一个字符串，该字符串用于指定验证失败时的错误信息。

`group()`定义了一个类数组，用于指定验证组，验证组是一种将验证分组的机制，允许在不同的情况下执行不同的验证。

`payload()`定义了一个类数组，用于指定有关验证约束的其他元数据。这个字段通常用于高级用途，例如与其他框架集成时，可以将额外的元数据信息传递给验证器。如果不需要提供额外的元数据，通常可以使用默认的空数组。

### 3. 实现验证类

```java
public class MobileRegExp {
    /**
     * 中国大陆、澳门、香港和台湾：
     * ^ 表示匹配字符串的开始位置。
     * 1 表示手机号码开头必须是数字 1（适用于中国大陆）。
     * [3-9] 表示第二个数字必须是 3、4、5、6、7、8、9 中的任意一个（适用于中国大陆）。
     * [5689] 表示手机号码开头必须是数字 5、6、8、9 中的任意一个（适用于澳门和香港）。
     * 09 表示手机号码开头必须是数字 09（适用于台湾）。
     * \d 表示任意数字。
     * {7} 或 {8} 或 {9} 表示前面的数字必须重复出现 7 次（适用于澳门和香港）或 8 次（适用于台湾）或 9 次（适用于中国大陆）。
     * | 表示逻辑或。
     * () 表示分组，用于将三个表达式组合在一起。
     * $ 表示匹配字符串的结束位置。
     */
    public final static String MOBILE_REG_EXP = "^(1[3-9]\\d{9}|[5689]\\d{7}|09\\d{8})$";

    /**
     * 中国-大陆：
     * ^ 表示匹配字符串的开始位置。
     * 1 表示手机号码开头必须是数字 1。
     * [3-9] 表示第二个数字必须是 3、4、5、6、7、8、9 中的任意一个。
     * \d 表示任意数字。
     * {9}表示前面的数字必须出现9次。
     * $ 表示匹配字符串的结束位置。
     */
    public final static String MOBILE_REG_EXP_ZH_CN = "^1[3-9]\\d{9}$";

    /**
     * 中国-澳门：
     * 澳门手机号码格式为8位数字，以6开头
     * ^ 表示匹配字符串的开始位置。
     * 6 表示手机号码开头必须是数字 6。
     * \d 表示任意数字。
     * {7} 表示前面的数字必须重复出现 7 次。
     * $ 表示匹配字符串的结束位置。
     */
    public final static String MOBILE_REG_EXP_ZH_MO = "^6\\d{7}$";

    /**
     * 中国-香港：
     * 香港手机号码格式为8位数字，以5、6、8、9开头
     * ^ 表示匹配字符串的开始位置。
     * [5689] 表示手机号码开头必须是数字 5、6、8、9 中的任意一个。
     * \d 表示任意数字。
     * {7} 表示前面的数字必须重复出现 7 次。
     * $ 表示匹配字符串的结束位置。
     */
    public final static String MOBILE_REG_EXP_ZH_HK = "^[5689]\\d{7}$";

    /**
     * 中国-台湾：
     * 台湾地区的手机号码开头一般是09，接下来是八位数字
     * ^ 表示匹配字符串的开始位置。
     * 09 表示手机号码开头必须是数字 09。
     * \d 表示任意数字。
     * {8} 表示前面的数字必须重复出现 8 次。
     * $ 表示匹配字符串的结束位置。
     */
    public final static String MOBILE_REG_EXP_ZH_TW = "^09\\d{8}$";

}

```

```java
public class MobileValidator implements ConstraintValidator<Mobile, String> {
    private boolean required = false;
    private String regExp;

    @Override
    public void initialize(Mobile mobile)
    {
        this.required = mobile.required();
        this.regExp = mobile.regexp();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if(!this.required) {
            return true;
        }
        return regExpMatch(value);
    }

    private boolean regExpMatch(String value) {
        if(StringUtils.hasText(value)) {
            return Pattern.compile(regExp).matcher(value).matches();
        }
        return false;
    }
}
```

