import sys

# 2진수 덧셈 백준 2729번
read=sys.stdin.readline
n=int(read())
maps=[list(map(str,read().split())) for _ in range(n)]
for i in range(n):
    a=int(maps[i][0],2)
    b=int(maps[i][1],2)
    res=bin(a+b)
    print(res[2:])


