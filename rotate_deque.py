from collections import deque
import sys
read=sys.stdin.readline
dq=deque()
left_n=0
right_n=0

N, M = map(int, read().split())
data=list(map(int,read().split()))

for i in range(1, N+1):
    dq.append(i)
