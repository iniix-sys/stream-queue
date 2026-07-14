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

import "./Admin.css";



export default function Admin() {


    const [user, setUser] = useState(null);

    const [videos, setVideos] = useState([]);

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");




    async function loadVideos() {


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


    }, []);






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

            <div className="admin-page">


                <div className="admin-login">


                    <h1>
                        🌙 Admin Access
                    </h1>


                    <p>
                        Stream Control Panel
                    </p>



                    <form onSubmit={handleLogin}>


                        <input

                            placeholder="Email"

                            onChange={
                                e =>
                                setEmail(
                                    e.target.value
                                )
                            }

                        />



                        <input

                            type="password"

                            placeholder="Password"

                            onChange={
                                e =>
                                setPassword(
                                    e.target.value
                                )
                            }

                        />



                        <button>
                            Login
                        </button>


                    </form>


                </div>


            </div>

        );

    }






    return (

        <div className="admin-page">


            <div className="dashboard">


                <header>


                    <div>

                        <h1>
                            🌙 Stream Control
                        </h1>

                        <p>
                            {videos.length}
                            {" "}
                            requests
                        </p>

                    </div>



                    <button
                        onClick={logout}
                    >
                        Logout
                    </button>


                </header>





                <section className="queue">


                {
                    videos.map(
                        (video,index)=>(


                            <div
                                className="video-card"
                                key={video.id}
                            >



                                <div>

                                    <h2>

                                        #{index+1}

                                    </h2>


                                    <p>

                                        Submitted by:

                                        {" "}

                                        <b>
                                            {
                                                video.submitted_by
                                            }
                                        </b>

                                    </p>



                                    <a

                                        href={video.url}

                                        target="_blank"

                                    >

                                        Open Video

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


                                </div>





                                <div className="actions">


                                {

                                    !video.approved &&

                                    <button

                                        onClick={
                                            () =>
                                            approve(
                                                video.id
                                            )
                                        }

                                    >

                                        Approve

                                    </button>

                                }



                                <button

                                    className="delete"

                                    onClick={
                                        () =>
                                        remove(
                                            video.id
                                        )
                                    }

                                >

                                    Delete

                                </button>


                                </div>


                            </div>


                        )
                    )
                }


                </section>


            </div>


        </div>

    );

}