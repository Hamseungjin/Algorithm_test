# 백준 16953번 A->B
import sys
from collections import deque

read=sys.stdin.readline
A,B=map(int, read().split())

dq=deque()
dq.append((B,1))

while dq:
    n,m=dq.popleft()
    if n/2==0:
        break
    if n==A:
        print(m)
        exit()
    if n%2==0:
        dq.append((n/2,m+1))
    elif n%2==1:
        dq.append(((n-1)/10,m+1))
print(-1)
# 42-> 21 -> (20)/10-> 2
