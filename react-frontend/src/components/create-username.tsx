import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useState } from "react";
import { UserService } from "@/services/user-service";
import { useRouter } from "@tanstack/react-router";

export const CreateUserName = (): React.ReactNode => {
    const [username, setUsername] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const router = useRouter();

    const handleCreate = async () => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            alert("Cannot use empty username");
            return;
        }
        setButtonDisabled(true);
        const userCreated = await UserService.createUser(trimmedUsername);
        if (!userCreated) { // TODO: swap to userCreated instead of !userCreated
            router.navigate({ 
                to: '/game-rooms',
                search: { username: trimmedUsername }
            });
            return;
        }
        alert("Oops! An error occured, we couldn't assign you that username. Try a different one");
        setButtonDisabled(false);
        return;
    };

    return(<div className="flex flex-col items-center gap-8">
        <Card className="p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-white">Create Username</h2>
            <div className="space-y-4">
                <Input 
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-white placeholder:text-gray-300"
                />
                <Button 
                    onClick={handleCreate}
                    className="w-full text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
                    disabled={buttonDisabled}
                >
                    Create
                </Button>
            </div>
        </Card>
    </div>);
}