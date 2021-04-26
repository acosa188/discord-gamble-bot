const axios = require("axios");

const baseUrl = "https://discord-channel-points.herokuapp.com/api";

class ChannelPoints {
    constructor(user) {
        this.user = user;
    }

    async checkPoints(amount) {
        try {
            const { data } = await axios.get(`${baseUrl}/points/${this.user.id}`);
            return data.amount >= amount;
        }
        catch (err) {
            if (err.request.res.statusCode === 404) {
                try {
                    await axios.post(`${baseUrl}/users/register`,
                        {
                            userName: this.user.username,
                            userId: this.user.id
                        });

                    try {
                        await axios.put(`${baseUrl}/points/${this.user.id}/${1000}`);
                        return 1000 >= amount;
                    }
                    catch (err) {
                        console.log(`something went wrong when adding points to ${this.user.username}`)
                    }
                }
                catch (err) {
                    console.log(`something went wrong when registering ${this.user.username} user.`)
                    return false;
                }
            }
            return false;
        }
    }

    async winPoints(amount) {
        // check if user exist, if not then register
        try {
            const { data } = await axios.get(`${baseUrl}/points/${this.user.id}`);
            await axios.put(`${baseUrl}/points/${this.user.id}/${data.amount + amount}`);
        } catch (err) {
            if (err.request.res.statusCode === 404) {
                try {
                    await axios.post(`${baseUrl}/users/register`,
                        {
                            userName: this.user.username,
                            userId: this.user.id
                        });

                    try {
                        await axios.put(`${baseUrl}/points/${this.user.id}/${1000 + amount}`)
                    }
                    catch (err) {
                        console.log(`something went wrong when adding points to ${this.user.username}`)
                    }
                }
                catch (err) {
                    console.log(`something went wrong when registering ${this.user.username} user.`)
                }
            }
        }
    }

    async losePoints(amount) {
        // check if user exist, if not then register
        try {
            const { data } = await axios.get(`${baseUrl}/points/${this.user.id}`);
            await axios.put(`${baseUrl}/points/${this.user.id}/${data.amount - amount}`);
        } catch (err) {
            if (err.request.res.statusCode === 404) {
                try {
                    await axios.post(`${baseUrl}/users/register`,
                        {
                            userName: this.user.username,
                            userId: this.user.id
                        });

                    try {
                        await axios.put(`${baseUrl}/points/${this.user.id}/${1000}`)
                    }
                    catch (err) {
                        console.log(`something went wrong when adding points to ${this.user.username}`)
                    }
                }
                catch (err) {
                    console.log(`something went wrong when registering ${this.user.username} user.`)
                }
            }
        }
    }
}

module.exports = ChannelPoints;