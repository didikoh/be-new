@echo off
start cmd /k "cd frontend && npm run dev"
start cmd /k "cd backend && php -S localhost:8000 -t ./public"