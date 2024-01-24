import sys
from collections import deque
read=sys.stdin.readline
queue=deque()
N=int(read())# 카드 개수 입력

for i in range(1,N+1):
    queue.append(i) # 큐에 1~N까지 순서로 놓여있음.
i=1
while len(queue)!=1 :
   if i%2==0:
       queue.append(queue.popleft())
       i=i+1
   elif i%2==1:
       queue.popleft()
       i=i+1
print(queue[0])