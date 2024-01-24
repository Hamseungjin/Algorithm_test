import sys
from collections import deque

read=sys.stdin.readline
N=int(read())# 명령의 수
queue=deque()

for i in range(N):
    command=read().split()
    if command[0] == 'push':
        queue.append(int(command[1]))
    elif command[0] == 'front':
        if not queue:
            print(-1)
        else:
            print(queue[0])
    elif command[0] == 'back':
        if not queue:
            print(-1)
        else:
            print(queue[-1])
    elif command[0] == 'pop':
        if not queue:
            print(-1)
        else:
            print(queue.popleft())
    elif command[0] == 'size' :
        print(len(queue))
    elif command[0] == 'empty':
        if not queue:
            print(1)
        else :
            print(0)