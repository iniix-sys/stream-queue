import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import "./Home.css";


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
                count:"exact",
                head:true
            });



        if (!error) {

            setQueueLength(count || 0);

        }


    }





    useEffect(() => {


        loadQueueLength();


        const channel = supabase

            .channel("queue_count")

            .on(

                "postgres_changes",

                {

                    event:"*",

                    schema:"public",

                    table:"videos"

                },

                loadQueueLength

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

                approved:false,

                played:false

            });



        setLoading(false);



        if(error){

            alert(error.message);

            return;

        }



        setUrl("");

        setName("");



    }







    return (

        <div className="home">


            <div className="request-card">


                <h1>
                    🌙 Stream Requests
                </h1>


                <p className="subtitle">
                    Send a video request to the stream queue
                </p>



                <div className="queue-box">

                    <span>
                        Current Queue
                    </span>

                    <strong>
                        {queueLength}
                    </strong>

                    <span>
                        videos
                    </span>

                </div>





                <form onSubmit={submit}>


                    <input

                        placeholder="YouTube URL"

                        value={url}

                        onChange={
                            e =>
                            setUrl(e.target.value)
                        }

                    />



                    <input

                        placeholder="Nickname"

                        value={name}

                        onChange={
                            e =>
                            setName(e.target.value)
                        }

                    />



                    <button disabled={loading}>

                        {
                            loading
                            ?
                            "Sending..."
                            :
                            "Submit Request"
                        }

                    </button>


                </form>


            </div>


        </div>

    );

}