
import sys

read=sys.stdin.readline
printf=sys.stdout.write
stack=[]
N=int(read())
for i in range(N):
    command=read().split()
    if command[0] == 'push':
        X=int(command[1])
        stack.append(X)
    elif command[0] == 'pop':
        if not stack:
            print(-1)
        else :
            print(stack[-1])
            stack.pop()
    elif command[0] == 'top':
        if not stack:
            print(-1)
        else :
            print(stack[-1])
    elif command[0] == 'size':
        print(len(stack))
    elif command[0] == 'empty':
        if not stack: print(1)
        else : print(0)