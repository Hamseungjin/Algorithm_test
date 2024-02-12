import sys
from collections import deque

# 백준 N과 M(1) 15649
dq=deque()
read=sys.stdin.readline
N,M=map(int,read().split())

def backtracking():
    if len(dq)== M:
            print(" ".join(map(str,dq)))
    else:
        for i in range(1,N+1):
            if i not in dq:
                dq.append(i)
                backtracking()
                dq.pop()
backtracking()