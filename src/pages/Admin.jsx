import {
    useEffect,
    useState
} from "react";

import supabase from "../lib/supabase";

import {
    login,
    logout,
    getUser
} from "../lib/auth";



export default function Admin(){


    const [user,setUser] = useState(null);

    const [videos,setVideos] = useState([]);


    const [email,setEmail] = useState("");

    const [password,setPassword] = useState("");



    async function loadVideos(){


        const {
            data,
            error
        } = await supabase

            .from("videos")

            .select("*")

            .order(
                "created_at",
                {
                    ascending:true
                }
            );


        if(!error){

            setVideos(data);

        }


    }




    useEffect(()=>{


        async function start(){

            const current =
                await getUser();


            setUser(current);


            if(current){

                loadVideos();

            }

        }


        start();


    },[]);





    async function handleLogin(e){


        e.preventDefault();


        const {
            error
        } = await login(
            email,
            password
        );


        if(error){

            alert(error.message);

            return;

        }


        location.reload();


    }





    async function approve(id){


        await supabase

            .from("videos")

            .update({

                approved:true

            })

            .eq(
                "id",
                id
            );


        loadVideos();

    }




    async function remove(id){


        await supabase

            .from("videos")

            .delete()

            .eq(
                "id",
                id
            );


        loadVideos();

    }




    if(!user){


        return (

            <main>


                <h1>
                    Admin Login
                </h1>


                <form
                    onSubmit={handleLogin}
                >

                    <input

                        placeholder="Email"

                        onChange={
                            e=>
                            setEmail(
                                e.target.value
                            )
                        }

                    />


                    <input

                        type="password"

                        placeholder="Password"

                        onChange={
                            e=>
                            setPassword(
                                e.target.value
                            )
                        }

                    />


                    <button>
                        Login
                    </button>


                </form>


            </main>

        );


    }




    return (

        <main>


            <h1>
                🎬 Stream Control
            </h1>


            <button
                onClick={logout}
            >
                Logout
            </button>



            <h2>
                Requests
            </h2>


            {
                videos.map(video=>(

                    <div
                        key={video.id}
                        style={{
                            border:"1px solid #ccc",
                            padding:15,
                            margin:10
                        }}
                    >

                        <p>
                            Submitted by:
                            {" "}
                            {video.submitted_by}
                        </p>


                        <a
                            href={video.url}
                            target="_blank"
                        >
                            {video.url}
                        </a>


                        <p>

                        {
                            video.approved
                            ?
                            "✅ Approved"
                            :
                            "⏳ Waiting"
                        }

                        </p>



                        {!video.approved && (

                            <button
                                onClick={()=>
                                    approve(video.id)
                                }
                            >
                                Approve
                            </button>

                        )}



                        <button
                            onClick={()=>
                                remove(video.id)
                            }
                        >
                            Delete
                        </button>


                    </div>

                ))
            }


        </main>

    );

}