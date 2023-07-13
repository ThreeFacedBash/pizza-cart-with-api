document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username:'',
            cartID: '',
            cartPizzas: [],
            //
            totalCost:0.00, 
            smlPizza: 0.00, 
            mediPizza: 0.00, 
            lrgPizza: 0.00, 
            smlQuant: 0, 
            medQuant: 0, 
            lrgQuant: 0, 
            cartQuant: 0, 
            money: 0, 
            message: '', 
            clearMsg: '',
            //
            login(){
                if (this.username.length > 2){

                 localStorage['username'] =this.username;
                 this.createCart();
                }
                else {
                    alert('Username should be contain more than three characters')
                }
            },
            logout(){
                if(confirm("You are about to logout, click 'OK' to proceed.")){
                this.username='';
                this.cartID='';
                localStorage['cartID'] = '';
                localStorage['username'] ='';
                }
            },

            createCart(){
                if(!this.username){
                    this.cartID = ''
                    return Promise.resolve();
                }

                const cartCreationUrl =`https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
                
                const cartID = localStorage['cartID'];
                if(cartID) {
                    this.cartID = cartID;
                    return Promise.resolve();
                }
                else{
                    return axios.get(cartCreationUrl)
                    .then(result => {
                    this.cartID = result.data.cart_code;
                    localStorage['cartID'] = this.cartID;
                    })
                }
            },

            getCart(){
                const getCartUrl= `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartID}/get`
                return axios.get(getCartUrl);
            },

            addingPizza(pizzaID){
                const addingURL = 'https://pizza-api.projectcodex.net/api/pizza-cart/add'
                return axios.post(addingURL, {
                    "cart_code": this.cartID,
                    "pizza_id": pizzaID
                })
            },

            removingPizza(pizzaID){
                const addingURL = 'https://pizza-api.projectcodex.net/api/pizza-cart/remove'
                return axios.post(addingURL, {
                    "cart_code": this.cartID,
                    "pizza_id": pizzaID
                })
            },

            payment(amount){
                const payUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/pay'
                return axios.post(payUrl,{
                    "cart_code": this.cartID,
                    amount     
                });

            },


            showCartCost(){
                this.getCart().then(result =>{
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas; 
                    this.totalCost = cartData.total.toFixed(2);
                 });
            },

            init() {
                
              const storedUsername= localStorage['username'] 
              if(storedUsername){
                this.username = storedUsername;
              }

                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas
                         console.log(result.data)
                    });

                if (!this.cartID) {
                    this
                    .createCart()
                    .then((result) => {
                        this.showCartCost();
                    })
                }
                 
            },
            addToCart(pizzaID){
                this.addingPizza(pizzaID)
                    .then(() => {
                        this.showCartCost();
                    })
            },
            removeFromCart(pizzaID){
                this.removingPizza(pizzaID)
                    .then(() => {
                        this.showCartCost();
                    })
            },

            payForCart(){    
                //alert('You are due to pay: ' + this.totalCost);
                this.payment(this.money)
                    .then(result => {
                        if(result.data.status == 'failure'){
                            this.message = result.data.message;
                            setTimeout(() => this.message = '', 3000);
                        }
                        else if (result.data.status == 'success'){
                            this.message = result.data.message;

                            setTimeout(() => {
                                this.cartID = '';
                                this.cartPizzas = [];
                                this.totalCost = 0.00;
                                this.money = 0;
                                this.message = '';
                                localStorage['cartID'] = '';
                                this.createCart()
                            }, 3000)
                        }
                    })
            }
        }
    });
}); 
