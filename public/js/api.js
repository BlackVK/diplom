const API_URL = 'http://localhost:3000/api/';

const TD_API = {
    token: localStorage.getItem('api_token'),
    
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('api_token', token);
        } else {
            localStorage.removeItem('api_token');
        }
    },
    
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    },
    
    async request(endpoint, method = 'GET', data = null) {
        const options = { method, headers: this.getHeaders() };
        if (data) options.body = JSON.stringify(data);
        
        try {
            const response = await fetch(API_URL + endpoint, options);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Ошибка соединения с сервером' };
        }
    },
    
    async login(username, password) {
        const result = await this.request('auth/login', 'POST', { username, password });
        if (result.success && result.token) {
            this.setToken(result.token);
        }
        return result;
    },
    
    async register(username, email, password) {
        return await this.request('auth/register', 'POST', { username, email, password });
    },
    
    async logout() {
        const result = await this.request('auth/logout', 'POST');
        this.setToken(null);
        return result;
    },
    
    async saveGame(gameData) {
        return await this.request('game/save', 'POST', gameData);
    },
    
    async getLeaderboard(mapId, sort = 'waves') {
        return await this.request(`leaderboard/${mapId}?sort=${sort}`);
    }
};

window.TD_API = TD_API;