import sys
from collections import deque
# 백준 1743번 음식물 피하기
# 인접행렬 버전

# 예제
# 1 0 0 0
# 0 1 1 0
# 1 1 0 0

def bfs(x,y):
    # (0,0), (1,1), ... (N-1,N-1)
    delta = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    dq.append((x,y))
    check[x][y]=1
    df=1
    while dq:
        x,y= dq.popleft()
        for dx,dy in delta:
            nx=dx+x
            ny=dy+y
            if 0<=nx<N and 0<=ny<M and maps[nx][ny]==1 and check[nx][ny]==0:
                dq.append((nx,ny))
                check[nx][ny]=1
                df=df+1
    return df


read=sys.stdin.readline
N,M,K=map(int, read().split())
maps=[[0]*(M) for _ in range(N)]
check=[[0]*(M) for _ in range(N)]
dq=deque()
max=0

for i in range(K):
    a,b=map(int, read().split())
    maps[a-1][b-1]=1

for i in range(N):
    for j in range(M):
        if maps[i][j]==1 and check[i][j]==0:
            res=bfs(i,j)
            if(res > max):
                max=res
print(max)

