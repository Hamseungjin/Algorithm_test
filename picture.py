import sys
from collections import deque
# 백준 1926
def bfs(i,j):
    delta=[(0,1),(0,-1),(1,0),(-1,0)]
    dq.append((i,j))
    check[i][j]=1
    df=1
    while dq:
        x,y=dq.popleft()
        for dx,dy in delta:
            nx=dx+x
            ny=dy+y
            if 0<=nx<n and 0<=ny<m and maps[nx][ny]==1 and check[nx][ny]==0:
                dq.append((nx,ny))
                check[nx][ny]=1
                df+=1
    return df
dq=deque()
read=sys.stdin.readline
n,m=map(int,read().split())

maps=[list(map(int,read().split())) for _ in range(n)]
max=0
number=0
check=[[0]*m for _ in range(n)]

for i in range(n):
    for j in range(m):
        if maps[i][j]==1 and check[i][j]==0:
            res=bfs(i,j)
            number += 1
            if(res>=max):
                max=res
print(number)
print(max)
# 1 1 1 0 0
# 0 0 1 1 1
# 1 1 0 0 0
# 1 1 1 1 1


