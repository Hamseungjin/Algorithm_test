import sys
from collections import deque

def DFS(v):
    print(v, end=' ')
    visit_list[v]=True
    for i in range(1, N+1):
        if not visit_list[i] and graph[v][i]==True:
            DFS(i)


def BFS(v):
    q.append(v)
    visit_list2[v]=True
    while q:
        v= q.popleft()
        print(v, end=' ')
        for j in range(1, N+1): # Lexiual scope 변수
            if not visit_list2[j] and graph[v][j]==True:
                q.append(j)
                visit_list2[j]=True

#인접 행렬로 DFS&BFS 문제 푸는 경우.
read=sys.stdin.readline
q=deque()

N,M,V=map(int, read().split())
# 정점개수, 간선개수, 시작정점 번호

graph=[[False]*(N+1) for _ in range(N+1)]
# (N+1)^2 크기 list

visit_list=[False]*(N+1)
visit_list2=[False]*(N+1)

for i in range(M):
    a,b=map(int,read().split())
    graph[a][b]=graph[b][a]=True
DFS(V)
print()
BFS(V)
