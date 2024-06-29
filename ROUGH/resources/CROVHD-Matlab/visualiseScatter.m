% visualiseScatter.m 
% Draws scatter plots
%**************************************************************************
function visualiseScatter(dist,intervalLen,str,refdimen,colorDist)
    [m,n]=size(dist);
    %---------------------------Draw Outline------------------------------- 
    t=0:0.01:2*pi;
    r=intervalLen;
    m=m-3;
    for i=1:m
        plot(r*sin(t),r*cos(t),'Color',[0.0,0.0,0.0]);
        r=r+intervalLen;
    end
    
    rmax=(m)*intervalLen;
    degree=2*pi/n;
    for d=1:n
       line([0,rmax*cos(degree*d)],[0,rmax*sin(degree*d)],'LineWidth',1,'Color',[0.0 0.0 0.0]); 
    end
   
    axis square;
    set(gca,'XTick',[],'YTick',[0 intervalLen*[1:m]]);
    axis([-rmax rmax -rmax rmax+intervalLen]);
    ylabel('radius');
    grid on
    set(gca, 'XGrid', 'off','YGrid', 'off');
    text(intervalLen,rmax,str);
    for i=1:m+1
        line([0,-rmax],[(i-1)*intervalLen,(i-1)*intervalLen],'LineWidth',1,'Color',[0.0 0.0 0.0]);  
    end
    rmax=rmax+intervalLen;
    line([0,0],[-rmax,rmax],'LineWidth',1,'Color',[0.0 0.0 0.0]); 
    line([-rmax,rmax],[0,0],'LineWidth',1,'Color',[0.0 0.0 0.0]);
    
    %------------------------------Draw Scatter Plot-----------------------
    for i=1:m
        for j=1:n
            distArray=dist{i,j};
            [m1 n1]=size(distArray);
            string=num2str(dec2bin(j-1,log2(n)));
            refVec=zeros(1,n1);
            refVec(refdimen)=1;
            if string(refdimen)=='1'
                refVec(refdimen)=-1;
            end
            
            
            plotArray=ones(m1,2);
            
            for k=1:m1
               plotArray(k,1)=sqrt(sum(distArray(k,:).*distArray(k,:)));
               angle=acos(dot(distArray(k,:), refVec)/(norm(distArray(k,:))*norm(refVec))); % to find the angle with base axis
               plotArray(k,2)= (2*degree/pi)*angle+(j-1)*degree; 
            end
            colorpoints=chooseColor(length(dist{i,j}),colorDist);
            plot(plotArray(:,1).*sin(plotArray(:,2)),plotArray(:,1).*cos(plotArray(:,2)),'.','Color',colorpoints);
           
        end
    end