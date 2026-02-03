#!/bin/bash

# SmartBell Quick Start Script
# This script launches both backend and frontend servers

echo "🔔 Starting SmartBell System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "admin-frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the SmartBell root directory${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${BLUE}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${BLUE}📡 Starting Backend API...${NC}"
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8000/docs > /dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check backend.log for details.${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Backend running on http://localhost:8000${NC}"

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend...${NC}"
cd admin-frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

echo -e "${GREEN}✅ Frontend running on http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 SmartBell System is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📱 Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "🔌 Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "📚 API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "🔑 Login credentials:"
echo -e "   Username: ${GREEN}admin${NC}"
echo -e "   Password: ${GREEN}admin123${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running
wait
