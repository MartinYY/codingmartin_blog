# 生成静态文件
npm run build

# 如果是发布到自定义域名
# echo 'www.baidu.com(自定义域名)' > CNAME

git init
git add -A
git commit -m 'deploy'


git push -f git@github.com:MartinYY/codingmartin_blog.git main:master