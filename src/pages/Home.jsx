import { useEffect, useState } from "react";
import supabase from "../lib/supabase";


function validYoutube(url) {

    try {

        const u = new URL(url);

        return (
            u.hostname.includes("youtube.com") ||
            u.hostname.includes("youtu.be")
        );

    }

    catch {

        return false;

    }

}



export default function Home() {


    const [url, setUrl] = useState("");

    const [name, setName] = useState("");

    const [queueLength, setQueueLength] = useState(0);

    const [loading, setLoading] = useState(false);





    async function loadQueueLength() {


        const { count, error } = await supabase

            .from("videos")

            .select("*", {

                count: "exact",

                head: true

            });



        if (error) {

            console.error(
                "Queue count error:",
                error
            );

            return;

        }



        console.log(
            "Total queue:",
            count
        );


        setQueueLength(count || 0);


    }






    useEffect(() => {


        loadQueueLength();



        const channel = supabase

            .channel("queue_count")

            .on(

                "postgres_changes",

                {

                    event: "*",

                    schema: "public",

                    table: "videos"

                },

                () => {

                    loadQueueLength();

                }

            )

            .subscribe();




        return () => {

            supabase.removeChannel(channel);

        };


    }, []);







    async function submit(e) {


        e.preventDefault();



        if (!validYoutube(url)) {


            alert(
                "Please enter a valid YouTube link."
            );


            return;


        }





        setLoading(true);




        const { error } = await supabase

            .from("videos")

            .insert({

                url,

                submitted_by:
                    name.trim() || "Anonymous",

                approved: false,

                played: false

            });






        setLoading(false);





        if (error) {


            console.error(error);


            alert(
                error.message
            );


            return;


        }





        setUrl("");

        setName("");



        alert(
            "Video added to the approval queue!"
        );


    }






    return (

        <main

            style={{

                maxWidth: 600,

                margin: "50px auto",

                fontFamily: "Arial",

                textAlign: "center"

            }}

        >


            <h1>
                🎬 Stream Requests
            </h1>



            <p>

                Current Queue:

                <strong>

                    {" "}

                    {queueLength}

                    {" "}

                    videos

                </strong>

            </p>





            <form onSubmit={submit}>


                <input

                    placeholder="YouTube URL"

                    value={url}

                    onChange={
                        e =>
                        setUrl(
                            e.target.value
                        )
                    }

                    style={{

                        width: "100%",

                        padding: 12,

                        marginBottom: 10

                    }}

                />





                <input

                    placeholder="Nickname"

                    value={name}

                    onChange={
                        e =>
                        setName(
                            e.target.value
                        )
                    }

                    style={{

                        width: "100%",

                        padding: 12,

                        marginBottom: 10

                    }}

                />





                <button

                    disabled={loading}

                >

                    {

                        loading

                        ?

                        "Submitting..."

                        :

                        "Submit Request"

                    }


                </button>



            </form>



        </main>

    );

}