import sys
from collections import deque
def bfs(n,m):
    check=[[0]*M for _ in range(N)]

    while dq:
        x,y,df=dq.popleft()

        if(x,y) == (n,m):
            return df

        for dx, dy in delta:
            nx=dx+x
            ny=dy+y
            if 0<= nx < N and 0<= ny < M and MAP[nx][ny]==1 and not check[nx][ny]:
                dq.append((nx,ny,df+1))
                check[nx][ny]=1

read=sys.stdin.readline
N,M=map(int, read().split())
# 2차원 리스트 생성
MAP=[list(map(int,read().strip())) for _ in range(N)]
dq=deque([(0,0,1)]) # x,y,distance

delta=[(0,1),(0,-1),(1,0),(-1,0)]# 미로 문제 풀 떄 이동을 표현
# dx[0],dy[1] => 위
# dx[0],dy[-1] => 아래
# dx[1],dy[0] => 오른쪽
# dx[-1],dy[0] => 왼쪽

res=bfs(N-1,M-1)
print(res)
