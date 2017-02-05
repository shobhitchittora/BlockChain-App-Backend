# BlockChain-App-Backend
Node Backend for my BlockChain explorer


#DEPLOY

```javascript

{
    method: 'deploy',
    function: 'init',
    args: ["some_string"]
}

```


#QUERY
```javascript

{
    method: 'query',
    function: 'read',
    args: ["hello_world"]
}

{
    method: 'query',
    function: 'get_balance',
    args: ["shobhitchittora"]
}

{
    method: 'query',
    function:'get_claim',
    args: ["1234"]
}

```

#INVOKE

```javascript

{
    method: 'invoke',
    function: 'create_account',
    args: ["shobhitchittora","09031995","test@g","0"]
}


{
    method:'invoke',
    function: 'buy_policy',
    args: [	"shobhitchittora","1234"]
}

{
    method: 'invoke',
    function: 'claim_insurance',
    args: ["shobhitchittora","1234","medical","true","999"]
}

{
    method: 'invoke',
    function: 'add_balance',
    args: [	"shobhitchittora","199" ]
}
```