from collections import deque
import sys
read=sys.stdin.readline
T=int(read())

for i in range(T):
    dq = deque()
    dq2 = deque()
    flag=0

    p=read().strip() # 수행할 함수 입력
    n=int(read()) # 배열에 들어있는 수의 개수
    numbers = list(map(int, read().split()))

    dq.extend(numbers)
    dq2.extend(p)

    while dq2 :
        if dq2[0]=='R':
            dq.reverse()
        elif dq2[0]=='D':
            if not dq:
                flag = 1
                break
            else :
                dq.popleft()
        dq2.popleft()
    if flag==0:
        print(list(dq))
    else:
        print('error')