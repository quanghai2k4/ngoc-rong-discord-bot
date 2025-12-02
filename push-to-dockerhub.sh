#!/bin/bash

# Script để push ngoc-rong-bot image lên Docker Hub
# Usage: ./push-to-dockerhub.sh

echo "=========================================="
echo "Push Ngọc Rồng Bot to Docker Hub"
echo "=========================================="
echo ""

# Kiểm tra đã đăng nhập Docker Hub chưa
if ! docker info | grep -q "Username: quanghai2k4"; then
    echo "⚠️  Bạn chưa đăng nhập Docker Hub!"
    echo "Đang đăng nhập..."
    docker login -u quanghai2k4
    
    if [ $? -ne 0 ]; then
        echo "❌ Đăng nhập thất bại!"
        exit 1
    fi
fi

echo "✅ Đã đăng nhập Docker Hub"
echo ""

# Kiểm tra image có tồn tại không
if ! docker images | grep -q "quanghai2k4/ngoc-rong-bot"; then
    echo "❌ Image quanghai2k4/ngoc-rong-bot:latest không tồn tại!"
    echo "Chạy lệnh sau để build:"
    echo "  docker build -t quanghai2k4/ngoc-rong-bot:latest ."
    exit 1
fi

echo "📦 Image info:"
docker images quanghai2k4/ngoc-rong-bot:latest
echo ""

# Push image
echo "🚀 Đang push image lên Docker Hub..."
docker push quanghai2k4/ngoc-rong-bot:latest

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Push thành công!"
    echo "=========================================="
    echo ""
    echo "Image đã được push lên:"
    echo "  📦 quanghai2k4/ngoc-rong-bot:latest"
    echo ""
    echo "Để sử dụng image này trên máy khác:"
    echo "  docker pull quanghai2k4/ngoc-rong-bot:latest"
    echo ""
    echo "Hoặc sử dụng trong docker-compose.yml:"
    echo "  image: quanghai2k4/ngoc-rong-bot:latest"
    echo ""
else
    echo ""
    echo "❌ Push thất bại!"
    echo "Kiểm tra lại đăng nhập và thử lại."
    exit 1
fi
