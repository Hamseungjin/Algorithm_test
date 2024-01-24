import sys

# 제로 10773번
read = sys.stdin.readline
stack = [] # stack 초기화
K = int(read()) # 반복문 횟수 입력

for i in range(K):
    n = int(read())
    if n != 0:
        stack.append(n)
    elif n == 0:
        stack.pop()

print(sum(stack))