import sys
from collections import deque


def dfs(v):
    print(v, end=' ')
    visit_list[v]=True
    for i in graph[v]:
        if not visit_list[i]:
            dfs(i)

def bfs(v):
    dq.append(v)
    visit_list2[v]=True
    while dq :
        v=dq.popleft()
        print(v, end=' ')
        for i in graph[v]:
            if not visit_list2[i]:
                dq.append(i)
                visit_list2[i]=True


# DFS & BFS 인접리스트로 푸는 경우
read=sys.stdin.readline
dq=deque()
N,M,V=map(int, read().split())

graph=[[] for _ in range(N+1)]

visit_list=[False]*(N+1)
visit_list2=[False]*(N+1)

for i in range(M):
    a,b=map(int ,read().split())
    graph[a].append(b)
    graph[b].append(a)

for i in graph:
    i.sort()

dfs(V)
print()
bfs(V)
