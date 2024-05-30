import React, { useEffect, useState } from "react";
import { loginUser, ping } from "../../api/dxtrade/auth.api";
import { getUsers } from "../../api/dxtrade/account.api";
import { Button, Checkbox, FormLabel, TextField } from "@mui/material";
import './popupStyles.css';
import { validateLicense } from "../../api/internal/auth.api";
import { Broker } from "../../dto/internal/Broker";

type LoginPanelProps = {
    // broker: Broker;
    broker: string;
    onLogin: () => void
    onFail: () => void;
    toMainPage: () => void;
}

const LoginPanel: React.FC<LoginPanelProps> = (props) => {
    const { broker, onLogin, onFail, toMainPage } = props;

    const [credentials, setCredentials] = useState<{ username: string | undefined, password: string | undefined }>({
        username: undefined,
        password: undefined
    })
    const [saveCredentials, setSaveCredentials] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>();

    useEffect(() => {
        chrome.storage.local.get(null, function (data) {
            if (data.credentials) {
                const credentials = data.credentials[broker];
                setCredentials(credentials);
            }
        });
    }, [])

    //TODO handle multiple accounts and email login
    const handleLogin = async () => {
        if (!credentials) {
            setErrorMsg('Login and password are required')
        } else if (!credentials.username) {
            setErrorMsg('Login is required')
        } else if (!credentials.password) {
            setErrorMsg('Password is required')
        } else {
            chrome.storage.local.get(null, function (data) {
                var newData = { ...data };
                if (!data.credentials) {
                    const credentials: any = {};
                    // Object.values(Broker).forEach(broker => {
                    //     credentials[broker] = { username: undefined, password: undefined };
                    // });
                    newData = { ...data, credentials };
                }
                if (saveCredentials) {
                    const newCredentials = { ...data.credentials, [broker]: credentials };
                    newData = { ...data, credentials: newCredentials };
                }
                chrome.storage.local.set(newData, async function () {
                    console.log('new state: ' + JSON.stringify(newData))
                });
            });
            chrome.runtime.sendMessage({ type: 'login', login: credentials.username, password: credentials.password, broker: broker });
            chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
                if (message.type === "loginResult") {
                    if (message.response) {
                        onLogin();
                        setErrorMsg('Success!')
                    } else {
                        setErrorMsg('login failed');
                    }
                }
            });
            // const loggedIn = await login(credentials.username, credentials.password, broker);
            // if (loggedIn) {
            //     onLogin();
            //     setErrorMsg('Success!')
            // } else {
            //     setErrorMsg('login failed');
            // }
        }
    }

    return (
        <div className="login">
            <FormLabel>
                {errorMsg}
            </FormLabel>
            <FormLabel>
                Login
            </FormLabel>
            <TextField
                value={credentials?.username}
                onChange={(e: any) => { setCredentials({ ...credentials, username: e.target.value }) }}
            />
            <FormLabel>
                Password
            </FormLabel>
            <TextField
                type="password"
                value={credentials?.password}
                onChange={(e: any) => { setCredentials({ ...credentials, password: e.target.value }) }}
            />
            <div>
                <Checkbox
                    value={saveCredentials}
                    onChange={(e) => setSaveCredentials(e.target.checked)}
                />
                Remember me
            </div>

            <Button
                sx={{
                    color: 'white',
                    fontSize: '11px',
                    border: '1px solid #1e1e31',
                    marginBottom: '10px',
                    backgroundColor: '#40425d',
                    padding: '5px',
                    width: '150px',
                }}
                onClick={handleLogin}>
                Signin
            </Button>
            <Button
                sx={{
                    color: 'white',
                    fontSize: '11px',
                    border: '1px solid #1e1e31',
                    marginBottom: '10px',
                    backgroundColor: '#40425d',
                    padding: '5px',
                    width: '150px',
                }}
                onClick={toMainPage}>
                To main page
            </Button>
        </div>
    );
}
export default LoginPanel;