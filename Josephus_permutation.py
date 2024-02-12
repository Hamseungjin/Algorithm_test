from sys import stdin
from collections import deque


# 백준 1158번 요세푸스

# N: 1번부터~~ N번까지
# K: 이제 순서대로 K번째부터 사람을 제거

# 예제 입력
#N: 1번부터~7번까지
#K: 3번째부터 사람 제거

# 1 2 3 4 5 6 7  (3번째 부터 제거)
#  7 1 2 3 4 5 6
# 6 7 1 2 3 4 5
# 5 6 7 1 2 3 4
# 4 5 6 7 1 2 3

# DQ: 3
# 4 5 6 7 1 2
# DQ: 3 6
# 7 1 2 4 5
# DQ: 3 6 2
# 4 5 7 1
# DQ: 3 6 2 7
# 1 4 5
# DQ: 3 6 2 7 5
# 1 4

read=stdin.readline
N,K=map(int, read().split())

dq=deque([i for i in range(1,N+1)])
ar=[]
cnt=0

while dq:
    cnt +=1
    if cnt % K == 0:
        ar.append(dq.popleft())
    else :
        dq.append(dq.popleft())
print('<',", ".join(map(str,ar)),'>',sep="")
