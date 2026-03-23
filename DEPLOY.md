# 部署指南

## 方法一：GitHub + Vercel（推荐）

### 第 1 步：创建 GitHub 仓库
1. 打开 https://github.com/new
2. 仓库名：`cillian-blog`
3. 设为 **Public**
4. **不要勾选**「Add a README file」
5. 点击「Create repository」

### 第 2 步：上传代码
复制下面命令，**把 `你的GitHub用户名` 改成你真的用户名**：

```powershell
# 1. 打开 PowerShell，进入博客目录
cd "C:\Users\85455\.qclaw\workspace\blog"

# 2. 初始化 Git（只做一次）
git init

# 3. 添加所有文件
git add .

# 4. 提交（记录这次更改）
git commit -m "first commit"

# 5. 关联你的仓库（重要：把下面改成你的真实用户名）
git remote add origin https://github.com/你的GitHub用户名/cillian-blog.git

# 6. 推送到 GitHub
git push -u origin main
```

首次推送可能让你登录 GitHub，按弹窗提示操作即可。

### 第 3 步：Vercel 部署
1. 打开 https://vercel.com
2. 点击「Sign Up」用 **GitHub 账号**登录
3. 点击「Add New...」→「Project」
4. 在列表里找到 `cillian-blog`，点击它
5. 不用改任何设置，直接点最下面的「Deploy」

等 1-2 分钟，部署完成会显示预览链接。

### 第 4 步：绑定域名
1. 部署完成后点「Continue to Dashboard」
2. 点「Settings」→ 「Domains」
3. 输入 `cillian.xin`
4. 它会显示一条 CNAME 记录值（类似 `cname.vercel-dns.com`）
5. **去域名服务商**添加 DNS 解析：
   - 类型：CNAME
   - 主机记录：www（或 @）
   - 记录值：上面给的那个

---

## 方法二：Vercel CLI（可选）

如果想从命令行部署：
```powershell
# 安装
npm i -g vercel

# 进入博客目录
cd blog

# 登录并部署
vercel login
vercel
```
