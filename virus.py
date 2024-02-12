import sys
from collections import deque
# 백준 2606 인접리스트

def bfs():
    cnt=0
    check[1]=True
    while dq:
        v=dq.popleft()
        for i in maps[v]:
            if not check[i]:
                dq.append(i)
                check[i] = True
                cnt = cnt + 1
    return cnt
# 예제 입력 1
# 1={2,5} => 2,5 check
# 2={1,3,5} 3 check, {1,5} already check
# 3={2} 2 already check
# 4={7} no
# 5={1,2,6} 6 check, {1,2} already check
# 6={5} no
# 7={4} no


read=sys.stdin.readline

a=int(read())
b=int(read())

maps=[[] for _ in range(a+1)]
check=[False]*(a+1)
dq=deque()
dq.append(1)
for i in range(b):
    n,m=map(int, read().split())
    maps[n].append(m)
    maps[m].append(n)
res=bfs()
print(res)